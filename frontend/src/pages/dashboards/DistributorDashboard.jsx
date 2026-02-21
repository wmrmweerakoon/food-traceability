import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { distributorAPI } from '../../api/distributor';
import DataTable from '../../components/DataTable';
import TransportMap from '../../components/TransportMap';
import { Truck, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DistributorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transports, setTransports] = useState([]);
  const [selectedTransport, setSelectedTransport] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const columns = [
    {
      header: 'Transport ID',
      key: 'transportId',
    },
    {
      header: 'Origin',
      accessor: (row) => row.origin?.locationName || 'N/A',
    },
    {
      header: 'Destination',
      accessor: (row) => row.destination?.locationName || 'N/A',
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => {
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          in_transit: 'bg-blue-100 text-blue-800',
          delivered: 'bg-green-100 text-green-800',
          cancelled: 'bg-red-100 text-red-800',
        };
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            statusColors[row.status] || 'bg-gray-100 text-gray-800'
          }`}>
            {row.status || 'pending'}
          </span>
        );
      },
    },
    {
      header: 'Departure',
      accessor: (row) => row.departureTime
        ? new Date(row.departureTime).toLocaleDateString()
        : 'N/A',
    },
  ];

  if (loading) {
    return <div className="p-8">Loading transports...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Distributor Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Transports Table */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transport Records</h2>
            <DataTable
              data={transports}
              columns={columns}
              searchable
              pagination
              onRowClick={(row) => setSelectedTransport(row)}
            />
          </div>

          {/* Map */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Transport Tracking</h2>
            {selectedTransport ? (
              <TransportMap
                origin={selectedTransport.origin}
                destination={selectedTransport.destination}
                currentLocation={selectedTransport.currentLocation}
                locationHistory={selectedTransport.locationHistory || []}
                height="500px"
              />
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
                Select a transport record to view on map
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DistributorDashboard;

