import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

/**
 * Example Map Component using Leaflet
 * 
 * Usage:
 * <MapExample 
 *   origin={{ lat: 40.7128, lng: -74.0060 }} 
 *   destination={{ lat: 40.7589, lng: -73.9851 }}
 * />
 */
function MapExample({ origin, destination, currentLocation }) {
  const defaultCenter = origin || { lat: 40.7128, lng: -74.0060 };
  const defaultZoom = origin && destination ? 10 : 13;

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border">
      <MapContainer
        center={[defaultCenter.lat, defaultCenter.lng]}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {origin && (
          <Marker position={[origin.lat, origin.lng]}>
            <Popup>
              <div>
                <strong>Origin</strong>
                {origin.address && (
                  <p className="text-sm">{origin.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]}>
            <Popup>
              <div>
                <strong>Destination</strong>
                {destination.address && (
                  <p className="text-sm">{destination.address}</p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]}>
            <Popup>
              <div>
                <strong>Current Location</strong>
                <p className="text-sm">Last updated: {new Date(currentLocation.timestamp).toLocaleString()}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}

export default MapExample;

