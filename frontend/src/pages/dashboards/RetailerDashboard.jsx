import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { retailerAPI } from '../../api/retailer';
import { 
  Store, Package, AlertCircle, Plus, Edit2, Trash2, 
  CheckCircle, X, Search, Truck, Map, Thermometer,
  Calendar, Info, ArrowRight, ShieldCheck, Clock,
  ShoppingCart, Tag, Globe, ClipboardList, MapPin,
  Building, LayoutGrid, Navigation
} from 'lucide-react';
import TransportMap from '../../components/TransportMap';
import LocationPickerModal from '../../components/LocationPickerModal';

function RetailerDashboard() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState([]);
  const [stores, setStores] = useState([]);
  const [availableBatches, setAvailableBatches] = useState([]);
  const [incomingShipments, setIncomingShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJourneyModalOpen, setIsJourneyModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [validationData, setValidationData] = useState(null);
  
  // Store management modal states
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeFormData, setStoreFormData] = useState({ shopName: '', location: '' });
  
  // Map picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Form state
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
      const [invRes, storeRes, batchRes, shipRes] = await Promise.all([
        retailerAPI.getInventoryItems(),
        retailerAPI.getRetailerStores(),
        retailerAPI.getAvailableBatches(),
        retailerAPI.getIncomingShipments()
      ]);

      if (invRes.success) setInventory(invRes.data || []);
      if (storeRes.success) setStores(storeRes.data || []);
      if (batchRes.success) setAvailableBatches(batchRes.data || []);
      if (shipRes.success) setIncomingShipments(shipRes.data || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }

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

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const response = await retailerAPI.updateInventoryItem(selectedInventoryItem._id, {
        quantityAvailable: selectedInventoryItem.quantityAvailable,
        status: selectedInventoryItem.status,
        sku: selectedInventoryItem.sku,
        category: selectedInventoryItem.category,
        unitPrice: selectedInventoryItem.unitPrice
      });
      if (response.success) {
        setIsEditModalOpen(false);
        loadDashboardData();
      }
    } catch (error) {
      console.error('Update error:', error);
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

  const handleSellItem = async (batchId) => {
    try {
      const response = await retailerAPI.sellProduct(batchId, 1);
      if (response.success) {
        loadDashboardData();
      }
    } catch (error) {
      console.error('Sale error:', error);
      alert(error.response?.data?.message || 'Failed to process sale');
    }
  };

  const handleViewJourney = async (shipment) => {
    setSelectedShipment(shipment);
    setIsJourneyModalOpen(true);
    setValidationData(null);
    try {
      const response = await retailerAPI.validateProductExpiry({ 
        batchId: shipment.batchId?._id || shipment.batchId 
      });
      if (response.success) {
        setValidationData(response.data);
      }
    } catch (error) {
      console.error('Validation error:', error);
    }
  };

  const handleAcceptShipment = (shipment) => {
    setSelectedShipment(shipment);
    setFormData({
      productId: shipment.batchId?._id || '',
      productName: shipment.batchId?.productName || '',
      sku: `SKU-${shipment.transportId.split('-')[1]}`,
      storeId: stores[0]?._id || '', 
      category: shipment.batchId?.category || 'Fresh Produce',
      quantityAvailable: shipment.batchId?.quantity || 0,
      unitPrice: 0,
      manualExpiry: shipment.batchId?.expiryDate ? new Date(shipment.batchId.expiryDate).toISOString().split('T')[0] : '',
    });
    setIsAddModalOpen(true);
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
  
  // Store management functions
  const handleStoreSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (selectedStore) {
        response = await retailerAPI.updateRetailerStore(selectedStore._id, storeFormData);
      } else {
        response = await retailerAPI.createRetailerStore(storeFormData);
      }
      
      if (response.success) {
        setIsStoreModalOpen(false);
        loadDashboardData();
        setStoreFormData({ shopName: '', location: '' });
        setSelectedStore(null);
      }
    } catch (error) {
      console.error('Store operation error:', error);
      alert(error.response?.data?.message || 'Failed to manage store');
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm('Delete this store location? This will not delete inventory but removes the location link.')) return;
    try {
      const response = await retailerAPI.deleteRetailerStore(id);
      if (response.success) loadDashboardData();
    } catch (error) {
      console.error('Delete store error:', error);
    }
  };
  
  const handleLocationConfirm = (result) => {
    setStoreFormData(prev => ({ ...prev, location: result.name }));
    setIsPickerOpen(false);
  };

  const filteredInventory = inventory.filter(item => {
    const query = searchQuery.toLowerCase();
    const productName = (item.productId?.productName || item.productName || '').toLowerCase();
    const batchId = (item.batchId || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    
    return productName.includes(query) || 
           batchId.includes(query) || 
           category.includes(query);
  });

  const getStatusColor = (status, expiryDate) => {
    const isExpired = expiryDate && new Date(expiryDate) < new Date();
    if (isExpired || status === 'expired' || status === 'out-of-stock') return 'bg-rose-500 text-white';
    if (status === 'low_stock') return 'bg-amber-500 text-white';
    if (status === 'discontinued') return 'bg-slate-400 text-white';
    return 'bg-emerald-500 text-white';
  };

  if (loading && inventory.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Initializing Inventory Hub...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Store className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Retailer Hub</h1>
              <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                <span className="text-blue-600 mr-2">●</span> {user?.firstName} {user?.lastName} Dashboard
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => { setStoreFormData({ shopName: '', location: '' }); setSelectedStore(null); setIsStoreModalOpen(true); }}
              className="flex items-center px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition transform hover:scale-105 shadow-sm"
            >
              <Building className="w-4 h-4 mr-2 text-blue-600" />
              <span className="font-bold">Register Store</span>
            </button>
            <button
              onClick={() => { resetForm(); setIsAddModalOpen(true); }}
              className="flex items-center px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition transform hover:scale-105 shadow-xl shadow-slate-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-bold">Add to Stock</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* The Loading Dock */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Truck className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-black text-slate-900">The Loading Dock</h2>
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
              {incomingShipments.length} Arrived
            </span>
          </div>

          {incomingShipments.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 font-bold mb-1">No incoming shipments</p>
              <p className="text-slate-400 text-sm">When a distributor delivers a batch, it will appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {incomingShipments.map(shipment => (
                <div key={shipment._id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider">
                        Shipment Arrived
                      </div>
                      {shipment.riskFlag === 'High Risk' && (
                        <div className="bg-rose-100 text-rose-600 p-1.5 rounded-lg animate-pulse">
                          <AlertCircle className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">{shipment.batchId?.productName}</h3>
                    <p className="text-xs text-slate-500 font-medium mb-4">Batch: {shipment.batchId?.batchId}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-sm text-slate-600">
                        <Thermometer className="w-4 h-4 mr-2 text-blue-500" />
                        <span>Last Temp: <span className="font-bold">{shipment.storageTemperature}°C</span></span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Map className="w-4 h-4 mr-2 text-slate-400" />
                        <span className="truncate whitespace-normal">Destination: {shipment.destination?.locationName || 'Your Store'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-50 p-4 flex gap-2 border-t border-slate-100">
                    <button 
                      onClick={() => handleViewJourney(shipment)}
                      className="flex-1 px-4 py-2 border-2 border-slate-200 text-slate-700 rounded-xl hover:bg-white text-xs font-black uppercase tracking-widest transition"
                    >
                      Verify Journey
                    </button>
                    <button 
                      onClick={() => handleAcceptShipment(shipment)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-xs font-black uppercase tracking-widest transition shadow-lg shadow-blue-100"
                    >
                      Accept & Stock
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* My Store Locations Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Building className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-black text-slate-900">My Store Locations</h2>
            </div>
          </div>

          {stores.length === 0 ? (
            <div className="bg-blue-50/50 rounded-2xl border-2 border-dashed border-blue-200 p-8 flex flex-col items-center text-center">
              <MapPin className="w-8 h-8 text-blue-300 mb-3" />
              <p className="text-blue-900 font-bold text-sm mb-1">No store locations registered yet</p>
              <p className="text-blue-600/60 text-xs mb-4">You need at least one store location to manage inventory.</p>
              <button 
                onClick={() => { setStoreFormData({ shopName: '', location: '' }); setSelectedStore(null); setIsStoreModalOpen(true); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100"
              >
                Register First Store
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stores.map(store => (
                <div key={store._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center justify-between group">
                  <div className="flex items-center space-x-3">
                    <div className="bg-slate-100 p-2 rounded-lg text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600 transition">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">{store.shopName}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate w-32">{store.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => { setSelectedStore(store); setStoreFormData({ shopName: store.shopName, location: store.location }); setIsStoreModalOpen(true); }} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                      <Edit2 className="w-3 h-3 text-slate-400 hover:text-blue-600" />
                    </button>
                    <button onClick={() => handleDeleteStore(store._id)} className="p-1.5 hover:bg-slate-100 rounded-lg transition">
                      <Trash2 className="w-3 h-3 text-slate-400 hover:text-rose-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Inventory Control Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Package className="w-6 h-6 text-emerald-600" />
              <h2 className="text-xl font-black text-slate-900">Inventory Control</h2>
            </div>
            <div className="hidden md:flex items-center bg-white border border-slate-200 rounded-xl px-4 py-1.5 shadow-sm">
              <Search className="w-4 h-4 text-slate-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search inventory..." 
                className="text-sm outline-none bg-transparent w-40" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {filteredInventory.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-500 font-bold mb-1">
                {searchQuery ? "No matches found" : "Your shelves are empty"}
              </p>
              <p className="text-slate-400 text-sm mb-8">
                {searchQuery ? "Try a different keyword or Batch ID." : "Stock your items from the loading dock to begin tracking availability."}
              </p>
              <button 
                onClick={() => {
                  if (stores.length === 0) {
                     alert("Please register a store location first.");
                     setIsStoreModalOpen(true);
                  } else {
                     resetForm();
                     setIsAddModalOpen(true);
                  }
                }} 
                className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold shadow-xl shadow-slate-200"
              >
                Start Management
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredInventory.map(item => (
                <div key={item._id} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 -mr-10 -mt-10 rounded-full opacity-10 ${getStatusColor(item.status, item.expiryDate).split(' ')[0]}`}></div>
                  
                  <div className="p-6 pt-8 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${getStatusColor(item.status, item.expiryDate)}`}>
                        {new Date(item.expiryDate) < new Date() ? 'EXPIRED' : (item.status?.replace('-', ' ') || 'AVAILABLE')}
                      </span>
                      <div className="flex space-x-1">
                        <button onClick={() => { setSelectedInventoryItem(item); setIsEditModalOpen(true); }} className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDeleteItem(item._id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 mb-1 leading-tight">{item.productId?.productName || item.productName}</h3>
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                      <div className="flex items-center text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                        <Tag className="w-3 h-3 mr-1" /> {item.batchId}
                      </div>
                      <span className="text-[10px] text-slate-300">•</span>
                      <div className="flex items-center text-[10px] text-blue-500 font-black uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded-md">
                        Produced by: {item.productId?.farmerId?.firstName || 'Farmer'}
                      </div>
                    </div>

                    {/* Stock Visualization */}
                    <div className="mb-6 space-y-2">
                      <div className="flex items-center justify-between text-xs font-black text-slate-400 uppercase tracking-tighter">
                        <span>Available Units</span>
                        <span className="text-slate-900">{item.quantityAvailable}</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden p-0.5">
                        <div 
                          className={`h-full rounded-full transition-all duration-1000 ${item.quantityAvailable < 10 ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                          style={{ width: `${Math.min((item.quantityAvailable / 50) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mb-6 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold uppercase">Price</span>
                        <span className="text-slate-900 font-black">{item.currency || 'LKR'} {item.unitPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold uppercase">Expiry</span>
                        <span className={`font-black ${new Date(item.expiryDate) < new Date() ? 'text-rose-500' : 'text-slate-900'}`}>
                          {new Date(item.expiryDate).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 mt-1">
                        <span className="text-slate-400 font-bold uppercase">Location</span>
                        <span className="text-slate-900 font-medium truncate w-24 text-right">
                          {stores.find(s => s._id === item.storeId)?.shopName || 'Retail Area'}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleSellItem(item.batchId)}
                      disabled={item.quantityAvailable === 0}
                      className="w-full py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:bg-slate-200"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Process Sale</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Verification Journey Modal with OFF Integration */}
      {isJourneyModalOpen && selectedShipment && (
        <Modal 
          title="Product Integrity Validation" 
          onClose={() => setIsJourneyModalOpen(false)}
          subtitle={`Batch ID: ${selectedShipment.batchId?.batchId}`}
        >
          <div className="space-y-6">
            {/* Status Ribbon */}
            <div className={`p-4 rounded-3xl flex items-center ${selectedShipment.riskFlag === 'High Risk' ? 'bg-rose-50 border-2 border-rose-100' : 'bg-emerald-50 border-2 border-emerald-100'}`}>
              <div className={`p-3 rounded-2xl mr-4 ${selectedShipment.riskFlag === 'High Risk' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                {selectedShipment.riskFlag === 'High Risk' ? <AlertCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div>
                <h4 className={`text-sm font-black uppercase tracking-tight ${selectedShipment.riskFlag === 'High Risk' ? 'text-rose-900' : 'text-emerald-900'}`}>
                  {selectedShipment.riskFlag === 'High Risk' ? 'Critical Risk Flag' : 'Logistic Chain Secure'}
                </h4>
                <p className={`text-xs font-medium mt-0.5 ${selectedShipment.riskFlag === 'High Risk' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {selectedShipment.riskFlag === 'High Risk' 
                    ? "Environmental sensors triggered an alert during the transport phase." 
                    : "Zero environmental anomalies detected during delivery journey."}
                </p>
              </div>
            </div>

            {/* Modal Tabs/Sections */}
            <div className="space-y-8">
              {/* Map History */}
              <div>
                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                  <Map className="w-3 h-3 mr-2" /> Geographical History
                </h5>
                <div className="rounded-[2rem] overflow-hidden border-2 border-slate-100">
                  <TransportMap
                    origin={selectedShipment.origin}
                    destination={selectedShipment.destination}
                    currentLocation={selectedShipment.currentLocation}
                    locationHistory={selectedShipment.temperatureLogs}
                    height="300px"
                  />
                </div>
              </div>

              {/* OpenFoodFacts Data Section */}
              {validationData && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                    <Globe className="w-3 h-3 mr-2" /> Global Product Repository (OpenFoodFacts)
                  </h5>
                  <div className="bg-slate-900 rounded-[2rem] p-6 text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Globe className="w-20 h-20" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 relative z-10">
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Brand Name</p>
                        <p className="font-bold text-slate-200">{validationData.openFoodFactsData?.brands || 'Generic / Local Farmer'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Global Categories</p>
                        <p className="font-bold text-slate-200 truncate">{validationData.openFoodFactsData?.categories || selectedShipment.batchId?.category}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ingredients / Contents</p>
                        <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-2">
                          {validationData.openFoodFactsData?.ingredients_text || 'Natural raw product - no additives according to global standard.'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-center">
                          <p className="text-[8px] text-slate-500 font-black uppercase">Grade</p>
                          <p className={`text-sm font-black ${validationData.openFoodFactsData?.nutriscore_grade?.toUpperCase() || 'A'}`}>
                            {validationData.openFoodFactsData?.nutriscore_grade?.toUpperCase() || 'A'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[8px] text-slate-500 font-black uppercase">Integrity</p>
                          <p className="text-sm font-black text-blue-400">Verifying</p>
                        </div>
                      </div>
                      <div className="bg-white/10 px-3 py-1 rounded-full flex items-center text-[10px] font-bold">
                        <ShieldCheck className="w-3 h-3 mr-1.5 text-emerald-400" /> API Validated
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setIsJourneyModalOpen(false)}
                className="px-8 py-3 bg-slate-100 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition"
              >
                Done Reviewing
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Store Registration Modal */}
      {isStoreModalOpen && (
        <Modal 
          title={selectedStore ? "Update Shop" : "Register Store"} 
          onClose={() => setIsStoreModalOpen(false)}
          subtitle="Define a physical retail location"
        >
          <form onSubmit={handleStoreSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Shop Name</label>
                <div className="relative">
                  <Building className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 pl-12 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                    value={storeFormData.shopName}
                    onChange={(e) => setStoreFormData({ ...storeFormData, shopName: e.target.value })}
                    placeholder="e.g. City Center Branch"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-center">
                  Geolocation / Address
                  <button 
                    type="button" 
                    onClick={() => setIsPickerOpen(true)}
                    className="text-blue-600 hover:text-blue-800 text-[10px] font-black uppercase flex items-center"
                  >
                    <Navigation className="w-3 h-3 mr-1" /> Pick on Map
                  </button>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-300" />
                  <input
                    type="text"
                    className="w-full border-2 border-slate-100 rounded-2xl p-4 pl-12 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                    value={storeFormData.location}
                    onChange={(e) => setStoreFormData({ ...storeFormData, location: e.target.value })}
                    placeholder="e.g. 123 Metro Plaza, Colombo"
                    required
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsStoreModalOpen(false)} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Cancel</button>
              <button type="submit" className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-200">
                {selectedStore ? 'Update Location' : 'Register Location'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Inventory Check-in Modal */}
      {isAddModalOpen && (
        <Modal 
          title="Inventory Check-in" 
          onClose={() => { setIsAddModalOpen(false); resetForm(); }}
          subtitle="Link the logistics shipment to your store stock"
        >
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Arrival Batch</label>
                <select
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14 text-slate-700"
                  required
                  value={formData.productId}
                  onChange={(e) => {
                    const batch = availableBatches.find(b => b._id === e.target.value);
                    setFormData({ ...formData, productId: e.target.value, productName: batch?.productName || '' });
                  }}
                >
                  <option value="">Select an Arrived Batch...</option>
                   {availableBatches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.productName} ({b.batchId}) - Producer: {b.farmerId?.firstName} {b.farmerId?.lastName || b.farmerId?.username || 'Unknown Farmer'}
                    </option>
                  ))}
                  {/* Show selected shipment if arriving from dock */}
                   {selectedShipment && !availableBatches.find(b => b._id === selectedShipment.batchId?._id) && (
                    <option value={selectedShipment.batchId?._id}>
                      {selectedShipment.batchId?.productName} ({selectedShipment.batchId?.batchId}) - Producer: {selectedShipment.batchId?.farmerId?.firstName || 'Assigned Farmer'}
                    </option>
                  )}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Store Destination</label>
                <select
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14 text-slate-700"
                  required
                  value={formData.storeId}
                  onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                >
                  <option value="">Choose Store Location...</option>
                  {stores.map(s => (
                    <option key={s._id} value={s._id}>{s.shopName}</option>
                  ))}
                </select>
                {stores.length === 0 && (
                  <p className="text-[10px] text-rose-500 font-bold mt-2 uppercase flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> No stores found. Please register a store first.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Internal SKU</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  placeholder="e.g. SKU-12345"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Category</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Dairy"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Inbound Quantity</label>
                <input
                  type="number"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={formData.quantityAvailable}
                  onChange={(e) => setFormData({ ...formData, quantityAvailable: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">MSRP (Per Unit)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Final Expiry</label>
                <input
                  type="date"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={formData.manualExpiry}
                  onChange={(e) => setFormData({ ...formData, manualExpiry: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setIsAddModalOpen(false); resetForm(); }} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Discard</button>
              <button type="submit" disabled={stores.length === 0} className="px-10 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-200 disabled:opacity-50">Commit to Stock</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Inventory Modal */}
      {isEditModalOpen && selectedInventoryItem && (
        <Modal 
          title="Optimize Inventory" 
          onClose={() => setIsEditModalOpen(false)}
          subtitle={`Modifying ${selectedInventoryItem.productName}`}
        >
          <form onSubmit={handleUpdateItem} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-blue-900 rounded-3xl p-6 md:col-span-2 flex items-center shadow-xl shadow-blue-100">
                <div className="bg-white/10 p-2 rounded-xl mr-4">
                  <ShieldCheck className="text-white w-6 h-6" />
                </div>
                <p className="text-[10px] text-blue-100 font-bold leading-relaxed tracking-wide">
                  Internal stock levels and status are editable. Environmental traceability logs from the delivery journey remain immutable for audit integrity.
                </p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Adjust Quantity</label>
                <input
                  type="number"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={selectedInventoryItem.quantityAvailable}
                  onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, quantityAvailable: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Status</label>
                <select
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14 text-slate-700"
                  value={selectedInventoryItem.status || 'available'}
                  onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, status: e.target.value })}
                >
                  <option value="available">Available</option>
                  <option value="low_stock">Low Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="expired">Expired</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Retail Category</label>
                <input
                  type="text"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={selectedInventoryItem.category}
                  onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, category: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Retail Price</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 bg-slate-50 focus:border-blue-500 focus:bg-white outline-none transition font-bold text-sm h-14"
                  value={selectedInventoryItem.unitPrice}
                  onChange={(e) => setSelectedInventoryItem({ ...selectedInventoryItem, unitPrice: parseFloat(e.target.value) })}
                  required
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-8 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition">Cancel</button>
              <button type="submit" className="px-10 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition shadow-xl shadow-slate-200">Notify Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Location Picker Modal */}
      <LocationPickerModal 
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onConfirm={handleLocationConfirm}
        title="Select Shop Location"
      />
    </div>
  );
}

function Modal({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-12 duration-700">
        <div className="px-12 py-10 border-b border-slate-100 flex justify-between items-start bg-slate-50/30">
          <div>
            <h3 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">{title}</h3>
            {subtitle && <p className="text-slate-400 text-[10px] font-black mt-2 uppercase tracking-widest flex items-center">
              <ClipboardList className="w-3 h-3 mr-2 text-blue-500" /> {subtitle}
            </p>}
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-100 rounded-3xl transition-all duration-300 group">
            <X className="w-6 h-6 text-slate-300 group-hover:text-rose-500" />
          </button>
        </div>
        <div className="px-12 py-10 max-h-[70vh] overflow-y-auto font-['Outfit',sans-serif]">
          {children}
        </div>
      </div>
    </div>
  );
}

export default RetailerDashboard;
