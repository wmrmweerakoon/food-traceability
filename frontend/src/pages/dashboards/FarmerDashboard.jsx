import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { farmerAPI } from '../../api/farmer';
import DataTable from '../../components/DataTable';
import { Package, Plus, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function FarmerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      const response = await farmerAPI.getBatches();
      if (response.success) {
        setBatches(response.data || []);
      }
    } catch (error) {
      console.error('Error loading batches:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Batch ID',
      key: 'batchId',
    },
    {
      header: 'Product Name',
      key: 'productName',
    },
    {
      header: 'Quantity',
      accessor: (row) => `${row.quantity} ${row.unit}`,
    },
    {
      header: 'Harvest Date',
      accessor: (row) => new Date(row.harvestDate).toLocaleDateString(),
    },
    {
      header: 'Expiry Date',
      accessor: (row) => new Date(row.expiryDate).toLocaleDateString(),
    },
    {
      header: 'Status',
      key: 'status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {row.status || 'active'}
        </span>
      ),
    },
  ];

  if (loading) {
    return <div className="p-8">Loading batches...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Farmer Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
            </div>
            <button
              onClick={() => navigate('/farmer/batches/new')}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Batch
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Batches</p>
                <p className="text-2xl font-bold text-gray-900">{batches.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <QrCode className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Batches</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.filter(b => b.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">
                  {batches.reduce((sum, b) => sum + (b.quantity || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Batches Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Batches</h2>
          <DataTable
            data={batches}
            columns={columns}
            searchable
            pagination
            onRowClick={(row) => navigate(`/farmer/batches/${row._id}`)}
          />
        </div>
      </div>
    </div>
  );
}

export default FarmerDashboard;

