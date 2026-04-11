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
        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
          row.status === 'active' || !row.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
        }`}>
          {row.status || 'active'}
        </span>
      ),
    },
  ];

  if (loading && batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 font-medium animate-pulse">Syncing Production Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
      {/* 🏛️ Premium Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Farmer Console</h1>
              <div className="flex items-center text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                <span className="text-blue-600 mr-2">●</span> {user?.firstName} {user?.lastName} Dashboard
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/farmer/batches/new')}
              className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition transform hover:scale-105 shadow-xl shadow-blue-200"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="font-bold text-xs uppercase tracking-widest">Log Harvest</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Organic Stats Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Batches Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Batches</p>
                <p className="text-3xl font-black text-slate-900">
                  {batches.length} <span className="text-xs text-slate-300 font-bold ml-1 uppercase">units</span>
                </p>
              </div>
            </div>
          </div>

          {/* Active Batches Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Circulation</p>
                <p className="text-3xl font-black text-slate-900">
                  {batches.filter(b => b.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          {/* Volume Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all duration-500 shadow-inner">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Harvest Volume</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-slate-900">
                    {batches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0).toLocaleString()}
                  </p>
                  <span className="text-xs font-bold text-slate-400 tracking-tighter uppercase ml-1">Net kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Varieties Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-indigo-200 hover:bg-indigo-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 group-hover:bg-indigo-700 group-hover:text-white transition-all duration-500 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cultivations</p>
                <p className="text-3xl font-black text-slate-900">
                  {new Set(batches.map(b => b.productName?.toLowerCase().trim())).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Traceability Table Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden transition-all duration-500 hover:shadow-2xl">
          <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2.5 rounded-2xl shadow-sm border border-blue-100">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight text-shadow-sm">Managed Harvest Units</h2>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-0.5 opacity-70">Supply Chain Traceability Intel</p>
              </div>
            </div>
            <div className="flex items-center bg-blue-50/50 px-4 py-2 rounded-xl border border-blue-100 shadow-sm">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></span>
               <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest">Active Tracking</span>
            </div>
          </div>
          <div className="p-4">
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
    </div>
  );
}

export default FarmerDashboard;

