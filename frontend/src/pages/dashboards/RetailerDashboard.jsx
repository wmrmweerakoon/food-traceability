import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerAPI } from '../../api/retailer';
import DataTable from '../../components/DataTable';
import { Store, Package, AlertCircle, Plus, Edit2, Trash2, CheckCircle, X, Search } from 'lucide-react';

function RetailerDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isValidateModalOpen, setIsValidateModalOpen] = useState(false);

  // Selection states
  const [selectedItem, setSelectedItem] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    productId: '',
    storeId: '',
    sku: '',
    productName: '',
    category: '',
    quantityAvailable: 0,
    unitPrice: 0,
    manualExpiry: '',
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [invRes, storeRes, batchRes] = await Promise.all([
        retailerAPI.getInventoryItems(),
        retailerAPI.getRetailerStores(),
        retailerAPI.getAvailableBatches()
      ]);

      if (invRes.success) setInventory(invRes.data || []);
      if (storeRes.success) setStores(storeRes.data || []);
      if (batchRes.success) setAvailableBatches(batchRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await retailerAPI.addProductToInventory(formData);
      if (response.success) {
        setIsAddModalOpen(false);
        loadDashboardData();
        resetForm();
      }
    } catch (error) {
      console.error('Error adding product:', error);
      alert(error.response?.data?.message || 'Failed to add product');
    }
  };

  const handleUpdateStatus = async (item, newStatus) => {
    try {
      const response = await retailerAPI.updateInventoryItem(item._id, { status: newStatus });
      if (response.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await retailerAPI.deleteInventoryItem(itemId);
      if (response.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleOpenValidate = (item) => {
    setSelectedItem(item);
    setValidationResult(null);
    setIsValidateModalOpen(true);
  };

  const runValidation = async () => {
    if (!selectedItem) return;
    setIsValidating(true);
    try {
      const response = await retailerAPI.validateProductExpiry({
        batchId: selectedItem.productId?._id || selectedItem.productId,
        expiryDate: selectedItem.expiryDate
      });
      if (response.success) {
        setValidationResult(response.data);
      }
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productId: '',
      storeId: '',
      sku: '',
      productName: '',
      category: '',
      quantityAvailable: 0,
      unitPrice: 0,
      manualExpiry: '',
    });
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: (row) => row.productName || row.productId?.productName || 'N/A',
    },
    {
      header: 'Batch ID',
      accessor: (row) => row.batchId || row.productId?.batchId || 'N/A',
    },
    {
      header: 'Stock',
      accessor: (row) => `${row.quantityAvailable || 0} ${row.productId?.unit || ''}`,
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
        const status = row.status || (isExpired ? 'expired' : 'available');

        const colors = {
          available: 'bg-green-100 text-green-800',
          expired: 'bg-red-100 text-red-800',
          low_stock: 'bg-yellow-100 text-yellow-800',
          discontinued: 'bg-gray-100 text-gray-800'
        };

        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || colors.available}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenValidate(row)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition"
            title="Validate Expiry"
          >
            <CheckCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedItem(row); setIsEditModalOpen(true); }}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded transition"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteItem(row._id)}
            className="p-1 text-red-600 hover:bg-red-50 rounded transition"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  if (loading && inventory.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const expiredItems = inventory.filter(
    item => item.expiryDate && new Date(item.expiryDate) < new Date()
  );
  const lowStockItems = inventory.filter(item => item.quantityAvailable < 10);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Retailer Dashboard</h1>
            <p className="text-sm text-gray-500">Managing inventory for {user?.firstName} {user?.lastName}</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Product
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Inventory" value={inventory.length} icon={<Store className="text-blue-600" />} bgColor="bg-blue-50" />
          <StatCard title="In Stock" value={inventory.filter(i => i.quantityAvailable > 0).length} icon={<Package className="text-green-600" />} bgColor="bg-green-50" />
          <StatCard title="Low Stock" value={lowStockItems.length} icon={<AlertCircle className="text-yellow-600" />} bgColor="bg-yellow-50" />
          <StatCard title="Expired Items" value={expiredItems.length} icon={<AlertCircle className="text-red-600" />} bgColor="bg-red-50" />
        </div>

        {/* main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Store Inventory</h2>
            <div className="flex items-center text-sm text-gray-500">
              <Search className="w-4 h-4 mr-2" />
              Search or filter below
            </div>
          </div>
          <div className="p-0">
            <DataTable
              data={inventory}
              columns={columns}
              searchable
              pagination
            />
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <Modal title="Add Product to Inventory" onClose={() => setIsAddModalOpen(false)}>
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
                <select
                  className="w-full border rounded-lg p-2"
                  required
                  value={formData.productId}
                  onChange={(e) => {
                    const batch = availableBatches.find(b => b._id === e.target.value);
                    setFormData({ ...formData, productId: e.target.value, productName: batch?.productName || '' });
                  }}
                >
                  <option value="">Select a batch...</option>
                  {availableBatches.map(b => (
                    <option key={b._id} value={b._id}>{b.productName} ({b.batchId})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Store</label>
                <select
                  className="w-full border rounded-lg p-2"
                  required
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                >
                  <option value="">Select a store...</option>
                  {stores.map(s => (
                    <option key={s._id} value={s._id}>{s.shopName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. MILK-001"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Dairy"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2"
                  value={formData.quantityAvailable}
                  onChange={(e) => setFormData({ ...formData, quantityAvailable: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border rounded-lg p-2"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Manual Expiry (Optional)</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={formData.manualExpiry}
                  onChange={(e) => setFormData({ ...formData, manualExpiry: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add to Inventory</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && selectedItem && (
        <Modal title="Edit Inventory Item" onClose={() => setIsEditModalOpen(false)}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              const response = await retailerAPI.updateInventoryItem(selectedItem._id, {
                quantityAvailable: selectedItem.quantityAvailable,
                status: selectedItem.status,
                sku: selectedItem.sku,
                category: selectedItem.category
              });
              if (response.success) {
                setIsEditModalOpen(false);
                loadDashboardData();
              }
            } catch (error) {
              console.error('Update error:', error);
            }
          }} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2"
                  value={selectedItem.quantityAvailable}
                  onChange={(e) => setSelectedItem({ ...selectedItem, quantityAvailable: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={selectedItem.status || 'available'}
                  onChange={(e) => setSelectedItem({ ...selectedItem, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="expired">Expired</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={selectedItem.sku}
                  onChange={(e) => setSelectedItem({ ...selectedItem, sku: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2"
                  value={selectedItem.category}
                  onChange={(e) => setSelectedItem({ ...selectedItem, category: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Update Item</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Validate Modal */}
      {isValidateModalOpen && selectedItem && (
        <Modal title="Expiry Validation (OpenFoodFacts)" onClose={() => setIsValidateModalOpen(false)}>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-blue-900">Validating Expiry</h4>
                <p className="text-xs text-blue-800 mt-1">
                  We are about to cross-reference this product's data with the OpenFoodFacts global database.
                </p>
              </div>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <p className="text-sm"><strong>Product:</strong> {selectedItem.productName || selectedItem.productId?.productName}</p>
              <p className="text-sm"><strong>Batch ID:</strong> {selectedItem.batchId || selectedItem.productId?.batchId}</p>
              <p className="text-sm"><strong>Current Expiry:</strong> {new Date(selectedItem.expiryDate).toLocaleDateString()}</p>
            </div>

            {validationResult ? (
              <div className={`p-4 rounded-lg ${validationResult.validation.isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                <div className="flex items-center mb-2">
                  {validationResult.validation.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  ) : (
                    <X className="w-5 h-5 text-red-600 mr-2" />
                  )}
                  <h4 className={`font-semibold ${validationResult.validation.isValid ? 'text-green-900' : 'text-red-900'}`}>
                    {validationResult.validation.isValid ? 'Validation Passed' : 'Validation Failed'}
                  </h4>
                </div>
                <ul className="text-xs space-y-1 ml-7">
                  {validationResult.validation.warnings.map((w, i) => <li key={i} className="text-red-700">• {w}</li>)}
                  {validationResult.validation.recommendations.map((r, i) => <li key={i} className="text-blue-700">• {r}</li>)}
                  {validationResult.validation.warnings.length === 0 && <li className="text-green-700">• No warnings found</li>}
                </ul>
              </div>
            ) : (
              <button
                onClick={runValidation}
                disabled={isValidating}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
              >
                {isValidating ? 'Validating...' : 'Run Validation'}
              </button>
            )}

            <div className="flex justify-end pt-4">
              <button onClick={() => setIsValidateModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function StatCard({ title, value, icon, bgColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
      <div className={`p-4 ${bgColor} rounded-xl mr-4`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-lg transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

export default RetailerDashboard;

