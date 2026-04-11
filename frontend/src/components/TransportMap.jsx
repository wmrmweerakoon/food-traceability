import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icons
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
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
  iconUrl: 'https://img.icons8.com/color/96/000000/truck.png', // Stable High-Resolution Truck
  iconSize: [45, 45],
  iconAnchor: [22, 22],
  popupAnchor: [0, -20]
});

const historyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [20, 32],
  iconAnchor: [10, 32],
  popupAnchor: [1, -28],
  shadowSize: [32, 32]
});

function TransportMap({ 
  origin, 
  destination, 
  currentLocation,
  locationHistory = [],
  height = '400px'
}) {
  const mapRef = useRef(null);

  const isValidCoords = (coords) => {
    return Array.isArray(coords) && 
           coords.length >= 2 && 
           typeof coords[0] === 'number' && 
           typeof coords[1] === 'number' &&
           !isNaN(coords[0]) && 
           !isNaN(coords[1]);
  };

  // Derive the actual GPS point for the "Live Truck"
  // Priority: 1. currentLocation if it has coords, 2. Latest point in history
  const getActiveLocation = () => {
    if (currentLocation && isValidCoords(currentLocation.coordinates)) {
      return currentLocation;
    }
    if (locationHistory && locationHistory.length > 0) {
      const lastEntry = locationHistory[locationHistory.length - 1];
      if (lastEntry.location && isValidCoords(lastEntry.location.coordinates)) {
        return lastEntry.location;
      }
    }
    return null;
  };

  const activeLocation = getActiveLocation();

  useEffect(() => {
    if (mapRef.current && (origin || destination || activeLocation)) {
      const map = mapRef.current;
      const bounds = [];

      if (origin && isValidCoords(origin.coordinates)) {
        bounds.push([origin.coordinates[1], origin.coordinates[0]]);
      }
      if (destination && isValidCoords(destination.coordinates)) {
        bounds.push([destination.coordinates[1], destination.coordinates[0]]);
      }
      if (activeLocation && isValidCoords(activeLocation.coordinates)) {
        bounds.push([activeLocation.coordinates[1], activeLocation.coordinates[0]]);
      }

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [origin, destination, activeLocation]);

  const getCenter = () => {
    if (activeLocation && isValidCoords(activeLocation.coordinates)) {
      return [activeLocation.coordinates[1], activeLocation.coordinates[0]];
    }
    if (origin && isValidCoords(origin.coordinates)) {
      return [origin.coordinates[1], origin.coordinates[0]];
    }
    return [6.9271, 79.8612]; 
  };

  const getRoutePolyline = () => {
    const points = [];
    if (origin && isValidCoords(origin.coordinates)) {
      points.push([origin.coordinates[1], origin.coordinates[0]]);
    }
    
    // Add history points in sequence to polyline
    if (locationHistory && locationHistory.length > 0) {
      locationHistory.forEach(entry => {
        if (entry.location && isValidCoords(entry.location.coordinates)) {
          points.push([entry.location.coordinates[1], entry.location.coordinates[0]]);
        }
      });
    }

    // Add current/active position if it's not already the last history point
    if (activeLocation && isValidCoords(activeLocation.coordinates)) {
      const lastHistoryPoint = locationHistory.length > 0 
        ? locationHistory[locationHistory.length - 1].location?.coordinates 
        : null;
        
      if (!lastHistoryPoint || 
          lastHistoryPoint[0] !== activeLocation.coordinates[0] || 
          lastHistoryPoint[1] !== activeLocation.coordinates[1]) {
        points.push([activeLocation.coordinates[1], activeLocation.coordinates[0]]);
      }
    }

    if (destination && isValidCoords(destination.coordinates)) {
      points.push([destination.coordinates[1], destination.coordinates[0]]);
    }
    
    // De-duplicate any points that are exactly the same
    const uniquePoints = points.filter((p, i) => {
      if (i === 0) return true;
      return p[0] !== points[i-1][0] || p[1] !== points[i-1][1];
    });

    return uniquePoints.length > 1 ? uniquePoints : null;
  };

  return (
    <div className="w-full rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <MapContainer
        center={getCenter()}
        zoom={origin && destination ? 8 : 10}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {origin && isValidCoords(origin.coordinates) && (
          <Marker
            position={[origin.coordinates[1], origin.coordinates[0]]}
            icon={originIcon}
          >
            <Popup>
              <div>
                <strong className="text-green-600">Origin</strong>
                <p className="text-sm mt-1">{origin.locationName}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {destination && isValidCoords(destination.coordinates) && (
          <Marker
            position={[destination.coordinates[1], destination.coordinates[0]]}
            icon={destinationIcon}
          >
            <Popup>
              <div>
                <strong className="text-red-600">Destination</strong>
                <p className="text-sm mt-1">{destination.locationName}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {activeLocation && isValidCoords(activeLocation.coordinates) && (
          <Marker
            position={[activeLocation.coordinates[1], activeLocation.coordinates[0]]}
            icon={currentLocationIcon}
          >
            <Popup>
              <div>
                <strong className="text-emerald-600">Current Live Position</strong>
                {activeLocation.timestamp && (
                  <p className="text-xs text-gray-600 mt-1">
                    Last Seen: {new Date(activeLocation.timestamp).toLocaleString()}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}

        {locationHistory.length > 0 && (
          <>
            {locationHistory.map((entry, index) => {
              if (!entry.location || !isValidCoords(entry.location.coordinates)) return null;
              
              const isLatest = currentLocation && isValidCoords(currentLocation.coordinates) && 
                               entry.location.coordinates[0] === currentLocation.coordinates[0] &&
                               entry.location.coordinates[1] === currentLocation.coordinates[1];
              
              if (isLatest) return null;

              return (
                <Marker
                  key={`history-${index}`}
                  position={[entry.location.coordinates[1], entry.location.coordinates[0]]}
                  icon={historyIcon}
                >
                  <Popup>
                    <div className="text-xs">
                      <p className="font-bold text-slate-500 uppercase tracking-tighter">History Checkpoint #{index + 1}</p>
                      {entry.temperature && <p className="text-emerald-600 font-bold">Temp: {entry.temperature}°C</p>}
                      {entry.timestamp && (
                        <p className="text-gray-400 mt-1">
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
            opacity={0.6}
            dashArray="10, 10"
          />
        )}
      </MapContainer>
    </div>
  );
}

export default TransportMap;
