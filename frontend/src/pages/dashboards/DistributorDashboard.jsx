import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { distributorAPI } from '../../api/distributor';
import DataTable from '../../components/DataTable';
import TransportMap from '../../components/TransportMap';
import { Truck, Plus, X, Edit2, CheckCircle, MapPin, Activity, Trash2 } from 'lucide-react';

function DistributorDashboard() {
  const { user } = useAuth();
  const [transports, setTransports] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [addForm, setAddForm] = useState({
    transportId: '',
    batchId: '',
    originName: '',
    destinationName: '',
    departureTime: '',
    estimatedArrivalTime: ''
  });

  const [updateForm, setUpdateForm] = useState({
    status: '',
    latitude: '',
    longitude: '',
    temperature: ''
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
        transportId: addForm.transportId,
        batchId: addForm.batchId,
        origin: { locationName: addForm.originName, coordinates: [0, 0] },
        destination: { locationName: addForm.destinationName, coordinates: [0, 0] },
        departureTime: addForm.departureTime,
        estimatedArrivalTime: addForm.estimatedArrivalTime
      };
      
      const response = await distributorAPI.createTransport(payload);
      if (response.success) {
        setIsAddModalOpen(false);
        loadTransports();
        setAddForm({ transportId: '', batchId: '', originName: '', destinationName: '', departureTime: '', estimatedArrivalTime: '' });
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

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTransport) return;

    try {
      if (updateForm.status !== selectedTransport.status) {
        await distributorAPI.updateTransportStatus(selectedTransport._id, { status: updateForm.status });
      }

      if (updateForm.latitude && updateForm.longitude) {
        await distributorAPI.trackRouteUpdate(selectedTransport._id, {
          lat: parseFloat(updateForm.latitude),
          lng: parseFloat(updateForm.longitude)
        });
        
        // Log temperature if provided
        if(updateForm.temperature) {
            await distributorAPI.updateTransportStatus(selectedTransport._id, { 
                storageTemperature: parseFloat(updateForm.temperature),
                temperatureLog: {
                    temperature: parseFloat(updateForm.temperature),
                    location: `${updateForm.latitude}, ${updateForm.longitude}`
                }
            });
        }
      } else if (updateForm.temperature) {
          await distributorAPI.updateTransportStatus(selectedTransport._id, { 
              storageTemperature: parseFloat(updateForm.temperature),
              temperatureLog: {
                  temperature: parseFloat(updateForm.temperature)
              }
          });
      }

      alert("Logistics updated successfully!");
      setUpdateForm({ ...updateForm, latitude: '', longitude: '', temperature: '' });
      loadTransports();
      
      // Refresh the selected transport
      const refreshTransport = transports.find(t => t._id === selectedTransport._id);
      if(refreshTransport) setSelectedTransport(refreshTransport);
      
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update transport');
    }
  };

  const handleDelete = async () => {
    if (!selectedTransport) return;
    
    // We get string batchId from population or direct property
    const batchIdStr = typeof selectedTransport.batchId === 'object' 
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

  const columns = [
    { header: 'Transport ID', key: 'transportId' },
    { header: 'Batch ID', accessor: (row) => typeof row.batchId === 'object' ? row.batchId.batchId : row.batchId },
    { header: 'Origin', accessor: (row) => row.origin?.locationName || 'N/A' },
    { header: 'Destination', accessor: (row) => row.destination?.locationName || 'N/A' },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const statuses = {
          'pending': 'bg-yellow-100 text-yellow-800',
          'in-transit': 'bg-blue-100 text-blue-800',
          'delivered': 'bg-green-100 text-green-800',
          'cancelled': 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${statuses[row.status] || 'bg-gray-100 text-gray-800'}`}>
            {row.status || 'pending'}
          </span>
        );
      },
    },
    {
      header: 'Update Tracker',
      render: (row) => (
        <button
          onClick={(e) => { 
            e.stopPropagation(); 
            handleRowClick(row);
            // Optionally scroll to map area if on a small screen
            window.scrollTo({ top: 500, behavior: 'smooth' });
          }}
          className="flex items-center px-3 py-1 bg-slate-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg transition text-sm font-medium"
          title="Update Status & Location"
        >
          <Edit2 className="w-4 h-4 mr-1" /> Edit
        </button>
      )
    }
  ];

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
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-blue-600"/> 
                Active Deliveries
              </h2>
            </div>
            <div className="p-0">
              <DataTable
                data={transports}
                columns={columns}
                searchable
                pagination
                onRowClick={(row) => handleRowClick(row)}
              />
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
                <div className="bg-slate-800 p-4 border-b border-slate-700">
                   <h3 className="text-white font-semibold flex items-center">
                     <Activity className="w-4 h-4 mr-2 text-emerald-400" />
                     Telemetry Console: {selectedTransport.transportId}
                   </h3>
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <Modal title="Start New Transport Leg" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Available Product Batches</label>
                {availableBatches.length > 0 ? (
                  <select 
                    required 
                    className="w-full border rounded-lg p-3 bg-blue-50 border-blue-200 text-blue-900 font-medium" 
                    value={addForm.batchId} 
                    onChange={e => setAddForm({...addForm, batchId: e.target.value})}
                  >
                    {availableBatches.map(b => (
                      <option key={b.batchId} value={b.batchId}>
                        {b.batchId} - {b.productName} ({b.quantity})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full border-2 border-dashed border-red-200 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                     No pending product batches available from farmers.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transport ID</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50" value={addForm.transportId} onChange={e => setAddForm({...addForm, transportId: e.target.value})} placeholder="e.g. TR-5555" />
              </div>
              <div>
                 {/* Empty grid space for alignment if needed, or make Transport ID col-span-2. Given spacing, making it span 2 is better */}
              </div>
              
              <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Origin Facility</label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.originName} onChange={e => setAddForm({...addForm, originName: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Destination Facility</label>
                    <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50 border-slate-200" value={addForm.destinationName} onChange={e => setAddForm({...addForm, destinationName: e.target.value})} />
                  </div>
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
