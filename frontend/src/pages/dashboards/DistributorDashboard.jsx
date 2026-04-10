import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { distributorAPI } from '../../api/distributor';
import DataTable from '../../components/DataTable';
import TransportMap from '../../components/TransportMap';
import { Truck, Plus, X, Edit2, CheckCircle } from 'lucide-react';

function DistributorDashboard() {
  const { user } = useAuth();
  const [transports, setTransports] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

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

  const handleUpdateClick = (transport) => {
    setSelectedTransport(transport);
    setUpdateForm({
      status: transport.status || 'in-transit',
      latitude: '',
      longitude: '',
      temperature: ''
    });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      // If status changed to delivered
      if (updateForm.status !== selectedTransport.status) {
        await distributorAPI.updateTransportStatus(selectedTransport._id, { status: updateForm.status });
      }

      // If location or temperature is provided, log it
      if (updateForm.latitude && updateForm.longitude) {
        await distributorAPI.trackRouteUpdate(selectedTransport._id, {
          location: {
            coordinates: [parseFloat(updateForm.longitude), parseFloat(updateForm.latitude)]
          },
          temperature: updateForm.temperature ? parseFloat(updateForm.temperature) : undefined
        });
      }

      setIsUpdateModalOpen(false);
      loadTransports();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update transport');
    }
  };

  const columns = [
    { header: 'Transport ID', key: 'transportId' },
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
      header: 'Departure',
      accessor: (row) => row.departureTime ? new Date(row.departureTime).toLocaleDateString() : 'N/A',
    },
    {
      header: 'Actions',
      render: (row) => (
        <button
          onClick={(e) => { e.stopPropagation(); handleUpdateClick(row); }}
          className="p-1 text-slate-600 hover:bg-slate-100 rounded transition"
          title="Update Route/Status"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )
    }
  ];

  if (loading) return <div className="p-8 text-center text-slate-500">Loading transports...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-['Outfit',sans-serif]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Distributor Dashboard</h1>
            <p className="text-slate-500 mt-1">Manage Logistics & Transportation</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transport
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transports Table */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Active Deliveries</h2>
            </div>
            <div className="p-0">
              <DataTable
                data={transports}
                columns={columns}
                searchable
                pagination
                onRowClick={(row) => setSelectedTransport(row)}
              />
            </div>
          </div>

          {/* Map */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-4">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Live Route Map</h2>
              <p className="text-sm text-slate-500">Click on a delivery record in the table to display its route mapping.</p>
            </div>
            {selectedTransport ? (
              <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                <TransportMap
                  origin={selectedTransport.origin}
                  destination={selectedTransport.destination}
                  currentLocation={selectedTransport.currentLocation}
                  locationHistory={selectedTransport.locationHistory || []}
                  height="500px"
                />
              </div>
            ) : (
              <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center p-12 text-slate-400 h-[500px]">
                <Truck className="w-12 h-12 mb-4 opacity-50" />
                <span>Select a transport record</span>
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
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Batch ID</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50" value={addForm.batchId} onChange={e => setAddForm({...addForm, batchId: e.target.value})} placeholder="e.g. BATCH-1234" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Transport ID</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50" value={addForm.transportId} onChange={e => setAddForm({...addForm, transportId: e.target.value})} placeholder="e.g. TR-5555" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Origin Facility</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50" value={addForm.originName} onChange={e => setAddForm({...addForm, originName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Destination Facility</label>
                <input required type="text" className="w-full border rounded-lg p-2 bg-slate-50" value={addForm.destinationName} onChange={e => setAddForm({...addForm, destinationName: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Departure Time</label>
                <input required type="datetime-local" className="w-full border rounded-lg p-2 bg-slate-50" value={addForm.departureTime} onChange={e => setAddForm({...addForm, departureTime: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Est. Arrival</label>
                <input required type="datetime-local" className="w-full border rounded-lg p-2 bg-slate-50" value={addForm.estimatedArrivalTime} onChange={e => setAddForm({...addForm, estimatedArrivalTime: e.target.value})} />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">Create Transport</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && selectedTransport && (
        <Modal title="Update Transport Log" onClose={() => setIsUpdateModalOpen(false)}>
          <form onSubmit={handleUpdateSubmit} className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1">Delivery Status</label>
              <select className="w-full border rounded-lg p-2 bg-slate-50" value={updateForm.status} onChange={e => setUpdateForm({...updateForm, status: e.target.value})}>
                <option value="in-transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="delayed">Delayed</option>
              </select>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-900 mb-2">Log Location & Telemetry</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">Latitude</label>
                  <input type="number" step="any" placeholder="e.g. 6.9271" className="w-full border rounded pl-2 py-1" value={updateForm.latitude} onChange={e => setUpdateForm({...updateForm, latitude: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-blue-800 mb-1">Longitude</label>
                  <input type="number" step="any" placeholder="e.g. 79.8612" className="w-full border rounded pl-2 py-1" value={updateForm.longitude} onChange={e => setUpdateForm({...updateForm, longitude: e.target.value})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-blue-800 mb-1">Temperature (°C) - Optional</label>
                  <input type="number" step="0.1" placeholder="e.g. 4.5" className="w-full border rounded pl-2 py-1" value={updateForm.temperature} onChange={e => setUpdateForm({...updateForm, temperature: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center">
                <CheckCircle className="w-4 h-4 mr-2" /> Save Log
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
