import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationMap = ({ lat, lng }) => {
  if (!lat || !lng) {
    return (
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f5' }}>
        No location data available
      </div>
    );
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: '200px', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[lat, lng]}>
        <Popup>
          Clock Location<br />
          Lat: {lat.toFixed(6)}, Lng: {lng.toFixed(6)}
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default LocationMap;
