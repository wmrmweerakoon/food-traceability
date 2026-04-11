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
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
      {/* Premium Forest Header */}
      <div className="bg-white border-b border-green-100 sticky top-0 z-10 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-emerald-600 font-bold uppercase tracking-widest text-[10px] mb-2 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Farmer Console
              </p>
              <h1 className="text-4xl font-black text-green-950 tracking-tight">Agri-Producer Portal</h1>
              <p className="text-slate-500 font-medium mt-1 inline-flex items-center">
                Reviewing harvest logs for 
                <span className="ml-2 px-3 py-1 bg-green-900 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg shadow-green-900/20">
                  {user?.firstName || 'Partner'}
                </span>
              </p>
            </div>
            <button
              onClick={() => navigate('/farmer/batches/new')}
              className="group flex items-center px-8 py-4 bg-green-950 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-green-950/20 hover:bg-green-900 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Log New Harvest
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        {/* Organic Stats Hub */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Batches Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-emerald-200 hover:bg-emerald-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Batches</p>
                <p className="text-3xl font-black text-green-950">
                  {batches.length} <span className="text-xs text-slate-300 font-bold ml-1 uppercase">units</span>
                </p>
              </div>
            </div>
          </div>

          {/* Active Batches Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-teal-200 hover:bg-teal-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-2xl text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">In Circulation</p>
                <p className="text-3xl font-black text-green-950">
                  {batches.filter(b => b.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          {/* Volume Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-amber-200 hover:bg-amber-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-inner">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Harvest Volume</p>
                <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-green-950">
                    {batches.reduce((sum, b) => sum + (Number(b.quantity) || 0), 0).toLocaleString()}
                  </p>
                  <span className="text-xs font-bold text-amber-600/70 tracking-tighter uppercase">Net kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Varieties Card */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 hover:shadow-xl hover:border-lime-200 hover:bg-lime-50/30 transition-all duration-300 group">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-lime-50 border border-lime-100 rounded-2xl text-lime-600 group-hover:bg-lime-600 group-hover:text-white transition-all duration-500 shadow-inner">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cultivations</p>
                <p className="text-3xl font-black text-green-950">
                  {new Set(batches.map(b => b.productName?.toLowerCase().trim())).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Traceability Table Container */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-8 py-8 border-b border-slate-100 flex items-center justify-between bg-green-50/30">
            <div className="flex items-center gap-3">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm border border-emerald-100">
                <Package className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-green-950 tracking-tight text-shadow-sm">Managed Harvest Units</h2>
                <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5 opacity-70">Supply Chain Traceability Intel</p>
              </div>
            </div>
            <div className="flex items-center bg-white px-4 py-2 rounded-xl border border-emerald-100 shadow-sm">
               <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
               <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Tracking</span>
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

