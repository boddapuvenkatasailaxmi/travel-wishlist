import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix default marker icon issue with leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const wishlistIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const visitedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

async function getCoordinates(destinationName) {
  const city = destinationName.split(',')[0].trim();
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(destinationName)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
  } catch (e) {
    console.log('Geocoding error:', e);
  }
  return null;
}

export default function MapView({ destinations }) {
  const [markers, setMarkers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMarkers() {
      setLoading(true);
      const results = [];
      for (const dest of destinations) {
        const coords = await getCoordinates(dest.name);
        if (coords) {
          results.push({ ...dest, ...coords });
        }
      }
      setMarkers(results);
      setLoading(false);
    }
    if (destinations.length > 0) {
      loadMarkers();
    } else {
      setLoading(false);
    }
  }, [destinations]);

  return (
    <div style={{
      background: 'white', borderRadius: 20,
      overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
      marginBottom: 24
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <h3 style={{ margin: 0, color: '#333' }}>🗺️ My Destinations Map</h3>
        <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#888' }}>
          <span>🔵 Wishlist</span>
          <span>🟢 Visited</span>
        </div>
      </div>

      {loading ? (
        <div style={{
          height: 400, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: '#888', fontSize: 14
        }}>
          Loading map... 🗺️
        </div>
      ) : (
        <MapContainer
          center={[20, 78]}
          zoom={3}
          style={{ height: 400, width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='© OpenStreetMap contributors'
          />
          {markers.map(dest => (
            <Marker
              key={dest._id}
              position={[dest.lat, dest.lng]}
              icon={dest.visited ? visitedIcon : wishlistIcon}
            >
              <Popup>
                <div style={{ minWidth: 150 }}>
                  <strong style={{ fontSize: 14 }}>{dest.name}</strong>
                  <br />
                  <span style={{ fontSize: 12, color: '#888' }}>{dest.continent}</span>
                  {dest.budget > 0 && (
                    <><br /><span style={{ fontSize: 12, color: '#667eea' }}>
                      💰 ₹{Number(dest.budget).toLocaleString('en-IN')}
                    </span></>
                  )}
                  {dest.note && (
                    <><br /><span style={{ fontSize: 12, color: '#888' }}>
                      📝 {dest.note}
                    </span></>
                  )}
                  <br />
                  <span style={{
                    fontSize: 11, fontWeight: 600,
                    color: dest.visited ? '#4CAF50' : '#FF9800'
                  }}>
                    {dest.visited ? '✓ Visited' : '🎯 Wishlist'}
                  </span>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      )}
    </div>
  );
}