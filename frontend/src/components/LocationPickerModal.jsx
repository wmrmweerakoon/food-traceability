import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import axios from 'axios';
import { MapPin, X, Check, Loader2 } from 'lucide-react';

const LocationPickerModal = ({ isOpen, onClose, onConfirm, title = "Pick Location" }) => {
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

   function MapEvents() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) return;
        
        setPosition([lat, lng]);
        setIsLoading(true);
        setAddress('Resolving location...');

        try {
          const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
            params: {
              format: 'json',
              lat: lat,
              lon: lng,
              zoom: 18,
              addressdetails: 1
            },
            headers: { 'User-Agent': 'Food-Traceability-App-Student-Project' }
          });

          if (response.data) {
            const displayName = response.data.display_name;
            setAddress(displayName);
          }
        } catch (error) {
          console.error("Reverse geocoding failed", error);
          setAddress(`Coordinates: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        } finally {
          setIsLoading(false);
        }
      },
    });
    return position && !isNaN(position[0]) && !isNaN(position[1]) ? <Marker position={position} /> : null;
  }

  const handleConfirm = () => {
    if (position && address) {
      onConfirm({
        name: address,
        coordinates: [position[1], position[0]] // [lon, lat]
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <MapPin className="text-blue-600 w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">{title}</h2>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-tight">Click on the map to select a point</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Map Body */}
        <div className="flex-1 relative">
          <MapContainer 
            center={[7.8731, 80.7718]} 
            zoom={8} 
            className="w-full h-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapEvents />
          </MapContainer>
        </div>

        {/* Footer Info Area */}
        <div className="p-6 bg-white border-t border-slate-100">
          <div className="mb-4">
             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Selected Location</label>
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[60px] flex items-center">
                {isLoading ? (
                  <div className="flex items-center text-blue-600 font-medium animate-pulse">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing geography...
                  </div>
                ) : position ? (
                  <p className="text-slate-700 font-medium leading-relaxed">{address}</p>
                ) : (
                  <p className="text-slate-400 italic">No point selected. Click the map to drop a pin.</p>
                )}
             </div>
          </div>

          <div className="flex gap-3">
             <button 
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition"
             >
                Cancel
             </button>
             <button 
                disabled={!position || isLoading}
                onClick={handleConfirm}
                className={`flex-[2] py-3 px-4 rounded-xl font-bold flex items-center justify-center transition shadow-lg shadow-blue-200 ${
                  position && !isLoading 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
             >
                <Check className="w-5 h-5 mr-2" />
                Confirm Selection
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPickerModal;
