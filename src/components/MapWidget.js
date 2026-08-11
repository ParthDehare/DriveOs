'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

export default function MapWidget({ vehicles = [] }) {
  const defaultCenter = [20.5937, 78.9629]; // India

  return (
    <MapContainer 
      center={vehicles.length > 0 && vehicles[0].lat ? [vehicles[0].lat, vehicles[0].lng] : defaultCenter} 
      zoom={vehicles.length > 0 ? 14 : 5} 
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {vehicles.map((v) => (
        <Marker key={v.sessionId} position={[v.lat, v.lng]}>
          <Popup>
            <div style={{ margin: 0 }}>
              <h4 style={{ margin: '0 0 var(--space-xs) 0', color: 'var(--text-primary)' }}>
                Session: {v.sessionId}
              </h4>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Lat: {v.lat.toFixed(4)}<br/>
                Lng: {v.lng.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
