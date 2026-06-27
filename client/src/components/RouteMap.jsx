import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const destIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const currentIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

function FitBounds({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions && positions.length >= 2) {
      map.fitBounds(positions, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
}

async function getCoordinates(name) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
  } catch (e) {
    console.log('Geocoding error:', e);
  }
  return null;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}

export default function RouteMap({ destination, onClose }) {
  const [currentPos, setCurrentPos] = useState(null);
  const [destPos, setDestPos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [distance, setDistance] = useState(null);

  useEffect(() => {
    async function loadRoute() {
      setLoading(true);
      setError('');
      const destCoords = await getCoordinates(destination.name);
      if (!destCoords) {
        setError('Could not find location!');
        setLoading(false);
        return;
      }
      setDestPos(destCoords);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const curr = [position.coords.latitude, position.coords.longitude];
          setCurrentPos(curr);
          setDistance(calculateDistance(curr[0], curr[1], destCoords[0], destCoords[1]));
          setLoading(false);
        },
        () => {
          const hyderabad = [17.3850, 78.4867];
          setCurrentPos(hyderabad);
          setDistance(calculateDistance(hyderabad[0], hyderabad[1], destCoords[0], destCoords[1]));
          setLoading(false);
        }
      );
    }
    loadRoute();
  }, [destination]);

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination.name)}`;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        background: 'white', borderRadius: 24, width: '100%', maxWidth: 750,
        maxHeight: '90vh', overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>

        <div style={{
          padding: '1.2rem 1.5rem',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <h3 style={{ margin: 0, color: 'white', fontSize: 18 }}>
              Route to {destination.name}
            </h3>
            {distance && (
              <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                Distance: ~{distance.toLocaleString()} km from your location
              </p>
            )}
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', color: 'white',
            border: 'none', borderRadius: 50, width: 36, height: 36,
            fontSize: 18, cursor: 'pointer'
          }}>X</button>
        </div>

        {distance && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: 10, padding: '1rem', background: '#f8f9fa'
          }}>
            {[
              { label: 'Distance', value: `~${distance.toLocaleString()} km`, emoji: '📏' },
              { label: 'By Flight', value: `~${Math.round(distance/800)} hrs`, emoji: '✈️' },
              { label: 'Continent', value: destination.continent, emoji: '🌍' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'white', borderRadius: 12, padding: '10px',
                textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}>
                <div style={{ fontSize: 22 }}>{s.emoji}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#333' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ height: 350 }}>
          {loading ? (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexDirection: 'column', gap: 12, color: '#888'
            }}>
              <div style={{ fontSize: 40 }}>🗺️</div>
              <p>Finding your route...</p>
            </div>
          ) : error ? (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#F44336', fontSize: 14
            }}>
              {error}
            </div>
          ) : (
            <MapContainer center={destPos || [20, 78]} zoom={4} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="OpenStreetMap" />
              {currentPos && (
                <Marker position={currentPos} icon={currentIcon}>
                  <Popup>Your Location</Popup>
                </Marker>
              )}
              {destPos && (
                <Marker position={destPos} icon={destIcon}>
                  <Popup>{destination.name}</Popup>
                </Marker>
              )}
              {currentPos && destPos && (
                <>
                  <Polyline positions={[currentPos, destPos]} color="#667eea" weight={3} dashArray="10,10" />
                  <FitBounds positions={[currentPos, destPos]} />
                </>
              )}
            </MapContainer>
          )}
        </div>

        <div style={{ padding: '1rem', textAlign: 'center', background: '#f8f9fa' }}>
          <a href={googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white', textDecoration: 'none',
            padding: '10px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600
          }}>Open in Google Maps</a>
        </div>

      </div>
    </div>
  );
}