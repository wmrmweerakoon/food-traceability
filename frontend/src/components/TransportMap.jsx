import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom icons
const originIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destinationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const currentLocationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function TransportMap({ 
  origin, 
  destination, 
  currentLocation,
  locationHistory = [],
  height = '400px'
}) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && (origin || destination || currentLocation)) {
      const map = mapRef.current;
      const bounds = [];

      if (origin?.coordinates) {
        bounds.push([origin.coordinates[1], origin.coordinates[0]]);
      }
      if (destination?.coordinates) {
        bounds.push([destination.coordinates[1], destination.coordinates[0]]);
      }
      if (currentLocation?.coordinates) {
        bounds.push([currentLocation.coordinates[1], currentLocation.coordinates[0]]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [origin, destination, currentLocation]);

  const getCenter = () => {
    if (currentLocation?.coordinates) {
      return [currentLocation.coordinates[1], currentLocation.coordinates[0]];
    }
    if (origin?.coordinates) {
      return [origin.coordinates[1], origin.coordinates[0]];
    }
    return [40.7128, -74.0060]; // Default to NYC
  };

  const getRoutePolyline = () => {
    const points = [];
    if (origin?.coordinates) {
      points.push([origin.coordinates[1], origin.coordinates[0]]);
    }
    if (currentLocation?.coordinates) {
      points.push([currentLocation.coordinates[1], currentLocation.coordinates[0]]);
    }
    if (destination?.coordinates) {
      points.push([destination.coordinates[1], destination.coordinates[0]]);
    }
    return points.length > 1 ? points : null;
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={getCenter()}
        zoom={origin && destination ? 10 : 13}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {origin?.coordinates && (
          <Marker
            position={[origin.coordinates[1], origin.coordinates[0]]}
            icon={originIcon}
          >
            <Popup>
              <div>
                <strong className="text-green-600">Origin</strong>
                <p className="text-sm mt-1">{origin.locationName}</p>
                {origin.address && (
                  <p className="text-xs text-gray-600">
                    {origin.address.city}, {origin.address.state}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {destination?.coordinates && (
          <Marker
            position={[destination.coordinates[1], destination.coordinates[0]]}
            icon={destinationIcon}
          >
            <Popup>
              <div>
                <strong className="text-red-600">Destination</strong>
                <p className="text-sm mt-1">{destination.locationName}</p>
                {destination.address && (
                  <p className="text-xs text-gray-600">
                    {destination.address.city}, {destination.address.state}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {currentLocation?.coordinates && (
          <Marker
            position={[currentLocation.coordinates[1], currentLocation.coordinates[0]]}
            icon={currentLocationIcon}
          >
            <Popup>
              <div>
                <strong className="text-blue-600">Current Location</strong>
                {currentLocation.timestamp && (
                  <p className="text-xs text-gray-600 mt-1">
                    Updated: {new Date(currentLocation.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {locationHistory.length > 0 && (
          <>
            {locationHistory.map((entry, index) => {
              if (!entry.location?.coordinates) return null;
              return (
                <Marker
                  key={index}
                  position={[entry.location.coordinates[1], entry.location.coordinates[0]]}
                >
                  <Popup>
                    <div className="text-xs">
                      <p>Location {index + 1}</p>
                      {entry.timestamp && (
                        <p className="text-gray-600">
                          {new Date(entry.timestamp).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </>
        )}

        {getRoutePolyline() && (
          <Polyline
            positions={getRoutePolyline()}
            color="#3b82f6"
            weight={3}
            opacity={0.7}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}

export default TransportMap;

