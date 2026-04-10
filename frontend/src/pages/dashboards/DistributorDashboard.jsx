import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { distributorAPI } from '../../api/distributor';
import DataTable from '../../components/DataTable';
import TransportMap from '../../components/TransportMap';
import LocationPickerModal from '../../components/LocationPickerModal';
import { 
  Truck, Plus, X, Edit2, CheckCircle, MapPin, 
  Activity, Trash2, Navigation, ArrowRight,
  Clock, Thermometer, ShieldCheck, AlertTriangle,
  ChevronRight
} from 'lucide-react';

function DistributorDashboard() {
  const { user } = useAuth();
  const [transports, setTransports] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState(null); // { form: 'add'|'edit', field: 'origin'|'destination' }

  // Form states
  const [addForm, setAddForm] = useState({
    batchId: '',
    originName: '',
    destinationName: '',
    departureTime: '',
    estimatedArrivalTime: '',
    vehicleNumber: '',
    currentLocation: '',
    storageTemperature: '4.0'
  });

  const [updateForm, setUpdateForm] = useState({
    status: '',
    latitude: '',
    longitude: '',
    temperature: ''
  });

  const [editForm, setEditForm] = useState({
    originName: '',
    destinationName: '',
    vehicleNumber: '',
    departureTime: '',
    estimatedArrivalTime: ''
  });

  useEffect(() => {
    loadTransports();
  }, []);

  const loadTransports = async () => {
    try {
      const response = await distributorAPI.getTransports();
      if (response.success) {
        setTransports(response.data || []);
      }
    } catch (error) {
      console.error('Error loading transports:', error);
    } finally {
      setLoading(false);
    }
  };

  const openLocationPicker = (formType, fieldName) => {
    setPickerTarget({ form: formType, field: fieldName });
    setIsPickerOpen(true);
  };

  const handleLocationConfirm = (result) => {
    if (!pickerTarget) return;

    if (pickerTarget.form === 'add') {
      if (pickerTarget.field === 'origin') {
        setAddForm(prev => ({ ...prev, originName: result.name }));
      } else {
        setAddForm(prev => ({ ...prev, destinationName: result.name }));
      }
    } else {
      if (pickerTarget.field === 'origin') {
        setEditForm(prev => ({ ...prev, originName: result.name }));
      } else {
        setEditForm(prev => ({ ...prev, destinationName: result.name }));
      }
    }
    setIsPickerOpen(false);
  };

  const openAddModal = async () => {
    setIsAddModalOpen(true);
    try {
      const resp = await distributorAPI.getAvailableBatches();
      if (resp.success) {
        setAvailableBatches(resp.data || []);
        if (resp.data.length > 0) {
          setAddForm(prev => ({ ...prev, batchId: resp.data[0].batchId }));
        }
      }
    } catch (error) {
      console.error("Error fetching batches", error);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        batchId: addForm.batchId,
        vehicleNumber: addForm.vehicleNumber,
        currentLocation: addForm.currentLocation || addForm.originName,
        storageTemperature: parseFloat(addForm.storageTemperature),
        origin: { locationName: addForm.originName, coordinates: [0, 0] },
        destination: { locationName: addForm.destinationName, coordinates: [0, 0] },
        departureTime: addForm.departureTime,
        estimatedArrivalTime: addForm.estimatedArrivalTime
      };
      
      const response = await distributorAPI.createTransport(payload);
      if (response.success) {
        setIsAddModalOpen(false);
        loadTransports();
        setAddForm({ 
          batchId: '', 
          originName: '', 
          destinationName: '', 
          departureTime: '', 
          estimatedArrivalTime: '',
          vehicleNumber: '',
          currentLocation: '',
          storageTemperature: '4.0'
        });
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to add transport');
    }
  };

  const handleRowClick = (transport) => {
    setSelectedTransport(transport);
    setUpdateForm({
      status: transport.status || 'in-transit',
      latitude: '',
      longitude: '',
      temperature: ''
    });
  };

  const openEditModal = () => {
    if (!selectedTransport) return;
    setEditForm({
      originName: selectedTransport.origin?.locationName || '',
      destinationName: selectedTransport.destination?.locationName || '',
      vehicleNumber: selectedTransport.vehicleNumber || '',
      departureTime: selectedTransport.departureTime ? new Date(selectedTransport.departureTime).toISOString().slice(0, 16) : '',
      estimatedArrivalTime: selectedTransport.estimatedArrivalTime ? new Date(selectedTransport.estimatedArrivalTime).toISOString().slice(0, 16) : ''
    });
    setIsEditModalOpen(true);
  };

   const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTransport) return;

    try {
      const batchIdStr = (selectedTransport.batchId?._id || selectedTransport.batchId)?.toString();
      if (!batchIdStr) throw new Error("Batch ID missing");

      const payload = {
        origin: { locationName: editForm.originName },
        destination: { locationName: editForm.destinationName },
        vehicleNumber: editForm.vehicleNumber,
        departureTime: editForm.departureTime,
        estimatedArrivalTime: editForm.estimatedArrivalTime
      };

      const response = await distributorAPI.updateTransportByBatchId(batchIdStr, payload);
      if (response.success) {
        setIsEditModalOpen(false);
        await loadTransports();
        setSelectedTransport(response.data);
        alert("Transport details updated successfully!");
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to update transport');
    }
  };

   const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTransport) return;

    try {
      const batchIdStr = (selectedTransport.batchId?._id || selectedTransport.batchId)?.toString();
      if (!batchIdStr) throw new Error("Batch ID missing");

      const payload = {
        deliveryStatus: updateForm.status || undefined,
        storageTemperature: updateForm.temperature ? parseFloat(updateForm.temperature) : undefined,
        latitude: updateForm.latitude || undefined,
        longitude: updateForm.longitude || undefined,
        currentLocation: updateForm.latitude && updateForm.longitude 
          ? `${updateForm.latitude}, ${updateForm.longitude}` 
          : undefined
      };

      const response = await distributorAPI.updateTransportByBatchId(batchIdStr, payload);
      
      if (response.success) {
        alert("Logistics updated successfully!");
        setUpdateForm({ status: '', latitude: '', longitude: '', temperature: '' });
        await loadTransports();
        setSelectedTransport(response.data);
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message || 'Failed to update transport');
    }
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUpdateForm(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6)
          }));
        },
        (error) => {
          console.error("Location error", error);
          alert('Unable to retrieve your location automatically. Please accept the browser tracking permission.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleDelete = async () => {
    if (!selectedTransport) return;
    
    // We get string batchId from population or direct property
    const batchIdStr = typeof selectedTransport.batchId === 'object' && selectedTransport.batchId !== null
      ? selectedTransport.batchId.batchId 
      : selectedTransport.batchId;

    if (window.confirm(`Are you sure you want to completely cancel and delete transport log for Batch: ${batchIdStr}?`)) {
      try {
        await distributorAPI.deleteTransport(batchIdStr);
        setSelectedTransport(null);
        loadTransports();
        openAddModal(); // optional: refresh available batches logic if needed, but not strictly necessary here
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete transport');
      }
    }
  };

// Modern Shipment Card Component
const ShipmentCard = ({ transport, isSelected, onClick }) => {
  const batchIdStr = typeof transport.batchId === 'object' && transport.batchId !== null 
    ? transport.batchId.batchId 
    : transport.batchId;

  const statusColors = {
    'pending': 'bg-slate-100 text-slate-600',
    'in-transit': 'bg-blue-600 text-white',
    'delivered': 'bg-emerald-500 text-white',
    'cancelled': 'bg-rose-500 text-white',
  };

  return (
    <div 
      onClick={() => onClick(transport)}
      className={`cursor-pointer transition-all duration-200 rounded-xl border-2 p-5 ${
        isSelected 
        ? 'border-blue-500 bg-blue-50/50 ring-4 ring-blue-500/10' 
        : 'border-white bg-white hover:border-slate-200 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-lg font-bold text-slate-900">{batchIdStr}</h4>
          <p className="text-xs text-slate-500 font-medium">Internal ID: {transport.transportId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${statusColors[transport.status?.toLowerCase()] || 'bg-slate-100 text-slate-600'}`}>
          {transport.status || 'Pending'}
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4 text-slate-600">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase">From</p>
          <p className="text-sm font-semibold truncate" title={transport.origin?.locationName}>{transport.origin?.locationName || '---'}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold text-slate-400 uppercase">To</p>
          <p className="text-sm font-semibold truncate" title={transport.destination?.locationName}>{transport.destination?.locationName || '---'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <Thermometer className={`w-4 h-4 ${transport.riskFlag === 'High Risk' ? 'text-rose-500' : 'text-emerald-500'}`} />
          <span className={`text-sm font-bold ${transport.riskFlag === 'High Risk' ? 'text-rose-600' : 'text-emerald-600'}`}>
            {transport.storageTemperature}°C
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-tight">
            {transport.estimatedArrivalTime ? new Date(transport.estimatedArrivalTime).toLocaleDateString() : 'No ETA'}
          </span>
        </div>
      </div>
    </div>
  );
};

  if (loading) return <div className="p-8 text-center text-slate-500">Loading transports...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Logistics Hub</h1>
            <p className="text-slate-500 mt-1">Manage active transport legs and telemetry</p>
          </div>
          <button 
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transport
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Active Deliveries */}
          <div className="bg-white/50 rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col h-[750px]">
            <div className="p-6 border-b border-slate-100 bg-white">
              <div className="flex justify-between items-center mb-1">
                <h2 className="text-xl font-black text-slate-800 flex items-center uppercase tracking-tight">
                  <Truck className="w-5 h-5 mr-3 text-blue-600"/> 
                  Live Deliveries
                </h2>
                <span className="bg-blue-100 text-blue-600 text-[10px] font-black px-2 py-1 rounded-lg uppercase">
                  {transports.length} Active
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Monitoring real-time telemetry from transport nodes</p>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
              {transports.length > 0 ? (
                transports.map((transport) => (
                  <ShipmentCard 
                    key={transport._id} 
                    transport={transport} 
                    isSelected={selectedTransport?._id === transport._id}
                    onClick={handleRowClick}
                  />
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-10">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Truck className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-slate-800 font-bold">No Shipments Found</h3>
                  <p className="text-slate-400 text-sm mt-1 max-w-[200px]">Start a new transport leg to begin monitoring logistics.</p>
                </div>
              )}
            </div>
          </div>

          {/* Map & Update Console */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-red-500"/>
                Live Route Map
              </h2>
              {selectedTransport ? (
                <div className="rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-6">
                  <TransportMap
                    key={selectedTransport._id}
                    origin={selectedTransport.origin}
                    destination={selectedTransport.destination}
                    currentLocation={selectedTransport.currentLocation}
                    locationHistory={selectedTransport.temperatureLogs || []}
                    height="300px"
                  />
                </div>
              ) : (
                <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-12 text-slate-400 h-[300px] mb-6">
                  <MapPin className="w-12 h-12 mb-4 opacity-30" />
                  <span>Select a delivery to view the map route</span>
                </div>
              )}
            </div>

            {/* In-Line Update Terminal */}
            {selectedTransport && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
                   <h3 className="text-white font-semibold flex items-center">
                     <Activity className="w-4 h-4 mr-2 text-emerald-400" />
                     Telemetry Console: {selectedTransport.transportId}
                   </h3>
                   <button 
                     onClick={openEditModal}
                     className="text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1 rounded border border-slate-600 transition flex items-center"
                   >
                     <Edit2 className="w-3 h-3 mr-1" />
                     Edit Core Details
                   </button>
                </div>
                <div className="p-6">
                  <form onSubmit={handleUpdateSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Status Override</label>
                        <select className="w-full border rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition" value={updateForm.status} onChange={e => setUpdateForm({...updateForm, status: e.target.value})}>
                          <option value="pending">Pending</option>
                          <option value="in-transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Temperature Logger (°C)</label>
                        <input type="number" step="0.1" placeholder="e.g. 4.5" className="w-full border rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition" value={updateForm.temperature} onChange={e => setUpdateForm({...updateForm, temperature: e.target.value})} />
                      </div>
                      <div className="col-span-1 md:col-span-2 pt-2 border-t border-slate-100 mt-2 flex justify-between items-center">
                         <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Device Sensors</span>
                         <button type="button" onClick={handleGetLocation} className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center px-4 py-2 border border-blue-100 rounded-lg transition font-medium">
                            <MapPin className="w-4 h-4 mr-2" />
                            Auto-Fill Current GPS Location
                         </button>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">GPS Latitude</label>
                        <input type="number" step="any" placeholder="e.g. 6.9271" className="w-full border rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition" value={updateForm.latitude} onChange={e => setUpdateForm({...updateForm, latitude: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">GPS Longitude</label>
                        <input type="number" step="any" placeholder="e.g. 79.8612" className="w-full border rounded-lg p-2 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none transition" value={updateForm.longitude} onChange={e => setUpdateForm({...updateForm, longitude: e.target.value})} />
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-between items-center border-t border-slate-100 mt-2">
                      <button 
                        type="button" 
                        onClick={handleDelete}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg flex items-center transition"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Cancel Delivery Log
                      </button>
                      <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-lg hover:bg-slate-800 flex items-center transition shadow-md shadow-slate-200">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Transmit Log Data
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <Modal title="Edit Transport Details" onClose={() => setIsEditModalOpen(false)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                      Origin Facility
                      <button type="button" onClick={() => openLocationPicker('edit', 'origin')} className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-bold">
                        <Navigation className="w-3 h-3 mr-1" /> Pick on Map
                      </button>
                    </label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={editForm.originName} onChange={e => setEditForm({...editForm, originName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                      Destination Facility
                      <button type="button" onClick={() => openLocationPicker('edit', 'destination')} className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-bold">
                        <Navigation className="w-3 h-3 mr-1" /> Pick on Map
                      </button>
                    </label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={editForm.destinationName} onChange={e => setEditForm({...editForm, destinationName: e.target.value})} />
                  </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No.</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={editForm.vehicleNumber} onChange={e => setEditForm({...editForm, vehicleNumber: e.target.value})} />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Departure Time</label>
                    <input required type="datetime-local" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200 text-sm" value={editForm.departureTime} onChange={e => setEditForm({...editForm, departureTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Est. Arrival</label>
                    <input required type="datetime-local" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200 text-sm" value={editForm.estimatedArrivalTime} onChange={e => setEditForm({...editForm, estimatedArrivalTime: e.target.value})} />
                  </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 space-x-3">
              <button 
                 type="button" 
                 onClick={() => setIsEditModalOpen(false)}
                 className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              >
                 Cancel
              </button>
              <button 
                 type="submit" 
                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                 Save Changes
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal title="Start New Transport Leg" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Product Batch</label>
                  <select required className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.batchId} onChange={e => setAddForm({...addForm, batchId: e.target.value})}>
                    <option value="">Choose a batch...</option>
                    {availableBatches.length > 0 ? (
                      availableBatches.map(batch => (
                        <option key={batch._id} value={batch.batchId}>
                          {batch.productName} ({batch.batchId})
                        </option>
                      ))
                    ) : (
                      <option disabled>No available batches</option>
                    )}
                  </select>
               </div>
               <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">System Generated</span>
                  <div className="bg-slate-100 border border-slate-200 text-slate-500 rounded-lg p-2 text-sm italic">
                    Transport ID will be auto-assigned
                  </div>
               </div> 
              </div>
              
              <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                      Origin Facility
                      <button type="button" onClick={() => openLocationPicker('add', 'origin')} className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-bold">
                        <Navigation className="w-3 h-3 mr-1" /> Pick on Map
                      </button>
                    </label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.originName} onChange={e => setAddForm({...addForm, originName: e.target.value})} placeholder="e.g. Colombo Port" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex justify-between">
                      Destination Facility
                      <button type="button" onClick={() => openLocationPicker('add', 'destination')} className="text-blue-600 hover:text-blue-800 flex items-center text-xs font-bold">
                        <Navigation className="w-3 h-3 mr-1" /> Pick on Map
                      </button>
                    </label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.destinationName} onChange={e => setAddForm({...addForm, destinationName: e.target.value})} placeholder="e.g. Kandy Warehouse" />
                  </div>
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4 border-t pt-4 border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle No.</label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.vehicleNumber} onChange={e => setAddForm({...addForm, vehicleNumber: e.target.value})} placeholder="WP NB-1234" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Initial Location</label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.currentLocation} onChange={e => setAddForm({...addForm, currentLocation: e.target.value})} placeholder="Current city/checkpoint" />
                  </div>
              </div>

              <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Internal Temperature (°C)</label>
                  <input required type="number" step="0.1" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.storageTemperature} onChange={e => setAddForm({...addForm, storageTemperature: e.target.value})} />
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-4 border-t pt-4 mt-2 border-slate-100">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Departure Time</label>
                    <input required type="datetime-local" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200 text-sm" value={addForm.departureTime} onChange={e => setAddForm({...addForm, departureTime: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Est. Arrival</label>
                    <input required type="datetime-local" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200 text-sm" value={addForm.estimatedArrivalTime} onChange={e => setAddForm({...addForm, estimatedArrivalTime: e.target.value})} />
                  </div>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                 type="submit" 
                 disabled={availableBatches.length === 0}
                 className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
              >
                 Create Transport
              </button>
            </div>
          </form>
        </Modal>
      )}

      <LocationPickerModal 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleLocationConfirm}
        title={`Select ${pickerTarget?.field === 'origin' ? 'Origin' : 'Destination'} Location`}
      />
    </div>
  );
}

// Reusable clean Modal component
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-lg transition">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DistributorDashboard;
