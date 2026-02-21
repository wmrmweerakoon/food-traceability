import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerAPI } from '../../api/retailer';
import DataTable from '../../components/DataTable';
import { Store, Package, AlertCircle } from 'lucide-react';

function RetailerDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const response = await retailerAPI.getInventoryItems();
      if (response.success) {
        setInventory(response.data || []);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      key: 'productName',
    },
    {
      header: 'Batch ID',
      key: 'batchId',
    },
    {
      header: 'Stock',
      accessor: (row) => `${row.quantityInStock} ${row.unit}`,
    },
    {
      header: 'Expiry Date',
      accessor: (row) => row.expiryDate
        ? new Date(row.expiryDate).toLocaleDateString()
        : 'N/A',
    },
    {
      header: 'Status',
      render: (row) => {
        const isExpired = row.expiryDate && new Date(row.expiryDate) < new Date();
        const isLowStock = row.quantityInStock < 10;
        
        if (isExpired) {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
              Expired
            </span>
          );
        }
        if (isLowStock) {
          return (
            <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
              Low Stock
            </span>
          );
        }
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            Available
          </span>
        );
      },
    },
  ];

  if (loading) {
    return <div className="p-8">Loading inventory...</div>;
  }

  const expiredItems = inventory.filter(
    item => item.expiryDate && new Date(item.expiryDate) < new Date()
  );
  const lowStockItems = inventory.filter(item => item.quantityInStock < 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Retailer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Store className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inventory.filter(i => i.quantityInStock > 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Low Stock</p>
                <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Expired</p>
                <p className="text-2xl font-bold text-gray-900">{expiredItems.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Store Inventory</h2>
          <DataTable
            data={inventory}
            columns={columns}
            searchable
            pagination
          />
        </div>
      </div>
    </div>
  );
}

export default RetailerDashboard;

