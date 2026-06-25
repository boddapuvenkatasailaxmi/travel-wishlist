import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const CONTINENT_COLORS = {
  Asia:     { badge: '#FF9800', emoji: '🌏' },
  Europe:   { badge: '#4CAF50', emoji: '🏰' },
  Americas: { badge: '#2196F3', emoji: '🗽' },
  Africa:   { badge: '#E91E63', emoji: '🦁' },
  Oceania:  { badge: '#9C27B0', emoji: '🦘' },
};

const imageCache = {};

async function fetchImage(destinationName) {
  const city = destinationName.split(',')[0].trim();
  if (imageCache[city]) return imageCache[city];

  try {
    // Step 1: Search Wikipedia for the city
    const searchRes = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(city)}`
    );
    const searchData = await searchRes.json();

    // Step 2: Get the thumbnail image from Wikipedia
    if (searchData.thumbnail && searchData.thumbnail.source) {
      const url = searchData.thumbnail.source;
      imageCache[city] = url;
      return url;
    }
  } catch (e) {
    console.log('Wikipedia error:', e);
  }

  // Fallback to Pexels if Wikipedia has no image
  try {
    const res = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(city + ' travel')}&per_page=5`,
      { headers: { Authorization: import.meta.env.VITE_PEXELS_KEY } }
    );
    const data = await res.json();
    if (data.photos && data.photos.length > 0) {
      const url = data.photos[0].src.medium;
      imageCache[city] = url;
      return url;
    }
  } catch (e) {
    console.log('Pexels error:', e);
  }

  return `https://picsum.photos/seed/${encodeURIComponent(city)}/400/300`;
}

function DestinationCard({ dest, onToggle, onDelete }) {
  const [image, setImage] = useState('');
  const colors = CONTINENT_COLORS[dest.continent] || CONTINENT_COLORS['Asia'];

  useEffect(() => {
    fetchImage(dest.name).then(setImage);
  }, [dest.name]);

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      opacity: dest.visited ? 0.85 : 1,
    }}>
      <div style={{ position: 'relative', height: 160, background: '#f0f0f0' }}>
        {image ? (
          <img src={image} alt={dest.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 40
          }}>{colors.emoji}</div>
        )}
        {dest.visited && (
          <div style={{
            position: 'absolute', top: 10, right: 10,
            background: '#4CAF50', color: 'white',
            borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600
          }}>✓ Visited</div>
        )}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: colors.badge, color: 'white',
          borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 600
        }}>{colors.emoji} {dest.continent}</div>
      </div>
      <div style={{ padding: '1rem' }}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16, color: '#333' }}>{dest.name}</h3>
        {dest.budget > 0 && (
          <p style={{ margin: '0 0 6px', fontSize: 13, color: '#667eea', fontWeight: 600 }}>
            💰 ₹{Number(dest.budget).toLocaleString('en-IN')}
          </p>
        )}
        {dest.note && (
          <p style={{ margin: '0 0 12px', fontSize: 12, color: '#888', lineHeight: 1.4 }}>
            📝 {dest.note}
          </p>
        )}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onToggle(dest)} style={{
            flex: 1, padding: '8px', borderRadius: 10, border: 'none',
            cursor: 'pointer', fontSize: 12, fontWeight: 600,
            background: dest.visited ? '#FFF3E0' : '#E8F5E9',
            color: dest.visited ? '#FF9800' : '#4CAF50'
          }}>{dest.visited ? '↩ Unmark' : '✓ Mark Visited'}</button>
          <button onClick={() => onDelete(dest._id)} style={{
            padding: '8px 12px', borderRadius: 10, border: 'none',
            cursor: 'pointer', fontSize: 12,
            background: '#FFEBEE', color: '#F44336', fontWeight: 600
          }}>🗑</button>
        </div>
      </div>
    </div>
  );
}

export default function Wishlist() {
  const { user, logout } = useAuth();
  const [destinations, setDestinations] = useState([]);
  const [form, setForm] = useState({ name: '', continent: 'Asia', budget: '', note: '' });
  const [filter, setFilter] = useState('all');

  useEffect(() => { fetchDestinations(); }, []);

  const fetchDestinations = async () => {
    const { data } = await api.get('/destinations');
    setDestinations(data);
  };

  const handleAdd = async () => {
    if (!form.name) return alert('Please enter a destination name');
    const { data } = await api.post('/destinations', form);
    setDestinations([data, ...destinations]);
    setForm({ name: '', continent: 'Asia', budget: '', note: '' });
  };

  const toggleVisited = async (dest) => {
    const { data } = await api.put(`/destinations/${dest._id}`, { visited: !dest.visited });
    setDestinations(destinations.map(d => d._id === dest._id ? data : d));
  };

  const handleDelete = async (id) => {
    await api.delete(`/destinations/${id}`);
    setDestinations(destinations.filter(d => d._id !== id));
  };

  const filtered = destinations.filter(d => {
    if (filter === 'visited') return d.visited;
    if (filter === 'wishlist') return !d.visited;
    return true;
  });

  const visited = destinations.filter(d => d.visited).length;

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>

      <div style={{
        background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
        padding: '1rem 2rem', display: 'flex',
        justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.2)'
      }}>
        <div>
          <h1 style={{ color: 'white', margin: 0, fontSize: 24 }}>✈️ My Travel Wishlist</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontSize: 13 }}>
            {destinations.length} destinations · {visited} visited
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ color: 'white', fontSize: 14 }}>👋 Hi, {user.name}!</span>
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.2)', color: 'white',
            border: '1px solid rgba(255,255,255,0.4)', borderRadius: 20,
            padding: '6px 16px', cursor: 'pointer', fontSize: 13
          }}>Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Total', value: destinations.length, emoji: '🗺️', color: '#667eea' },
            { label: 'Visited', value: visited, emoji: '✅', color: '#4CAF50' },
            { label: 'Remaining', value: destinations.length - visited, emoji: '🎯', color: '#FF9800' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 16, padding: '1rem',
              textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontSize: 28 }}>{s.emoji}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 13, color: '#888' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white', borderRadius: 20, padding: '1.5rem',
          marginBottom: 24, boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 1rem', color: '#333' }}>➕ Add New Destination</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
            <input placeholder="🌍 Any destination (e.g. Ooty, Manali, Paris...)"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid #eee', fontSize: 14, outline: 'none' }}
            />
            <select value={form.continent}
              onChange={e => setForm({...form, continent: e.target.value})}
              style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid #eee', fontSize: 14, outline: 'none', background: 'white' }}>
              {Object.keys(CONTINENT_COLORS).map(c => <option key={c}>{c}</option>)}
            </select>
            <input placeholder="💰 Budget (₹)" type="number" value={form.budget}
              onChange={e => setForm({...form, budget: e.target.value})}
              style={{ padding: '10px 14px', borderRadius: 10, border: '2px solid #eee', fontSize: 14, outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <input placeholder="📝 Add a note..."
              value={form.note}
              onChange={e => setForm({...form, note: e.target.value})}
              style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '2px solid #eee', fontSize: 14, outline: 'none' }}
            />
            <button onClick={handleAdd} style={{
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              color: 'white', border: 'none', borderRadius: 10,
              padding: '10px 24px', fontSize: 14, cursor: 'pointer', fontWeight: 600
            }}>+ Add</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {['all', 'wishlist', 'visited'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '8px 20px', borderRadius: 20, border: 'none',
              cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: filter === f ? 'white' : 'rgba(255,255,255,0.3)',
              color: filter === f ? '#667eea' : 'white',
              boxShadow: filter === f ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
            }}>
              {f === 'all' ? '🌍 All' : f === 'wishlist' ? '🎯 Wishlist' : '✅ Visited'}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map(dest => (
            <DestinationCard key={dest._id} dest={dest}
              onToggle={toggleVisited} onDelete={handleDelete} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.8)' }}>
            <div style={{ fontSize: 60 }}>🗺️</div>
            <p style={{ fontSize: 18, marginTop: 12 }}>No destinations yet. Add one above!</p>
          </div>
        )}
      </div>
    </div>
  );
}