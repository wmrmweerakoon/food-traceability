import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmerAPI } from '../../api/farmer';
import { Package, Calendar, ShieldCheck, Thermometer, Droplets, ArrowLeft, Save, AlertCircle, CheckCircle, Plus } from 'lucide-react';

function EditBatch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    harvestDate: '',
    expiryDate: '',
    quantity: '',
    unit: 'kg',
    qualityGrade: 'Grade A',
    organicCertified: false,
    pesticideResidue: 'None Detected',
    storageConditions: {
      temperature: '',
      humidity: '',
      otherConditions: '',
    },
    notes: '',
    status: 'active'
  });

  useEffect(() => {
    loadBatch();
  }, [id]);

  const loadBatch = async () => {
    try {
      const response = await farmerAPI.getBatchById(id);
      if (response.success) {
        const batch = response.data;
        setFormData({
          productName: batch.productName || '',
          harvestDate: batch.harvestDate ? new Date(batch.harvestDate).toISOString().split('T')[0] : '',
          expiryDate: batch.expiryDate ? new Date(batch.expiryDate).toISOString().split('T')[0] : '',
          quantity: batch.quantity || '',
          unit: batch.unit || 'kg',
          qualityGrade: batch.qualityGrade || 'Grade A',
          organicCertified: !!batch.organicCertified,
          pesticideResidue: batch.pesticideResidue || 'None Detected',
          storageConditions: {
            temperature: batch.storageConditions?.temperature || '',
            humidity: batch.storageConditions?.humidity || '',
            otherConditions: batch.storageConditions?.otherConditions || '',
          },
          notes: batch.notes || '',
          status: batch.status || 'active'
        });
      }
    } catch (err) {
      setError('Failed to load batch data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('storage.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        storageConditions: {
          ...prev.storageConditions,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await farmerAPI.updateBatch(id, formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate(`/farmer/batches/${id}`), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update batch. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Record State...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif] pb-20">
      {/* 🏛️ Premium Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <button onClick={() => navigate(`/farmer/batches/${id}`)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-emerald-600 mr-2">
                <ArrowLeft className="w-5 h-5" />
             </button>
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Edit Batch Entry</h1>
              <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                <span className="text-emerald-600 mr-2">●</span> Production Metadata Management
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* 📦 Specification Overhaul */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-10">
            <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-slate-100">
               <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-emerald-600" />
               </div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Product Specifications</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Identity</label>
                  <input
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition font-bold text-slate-900"
                    required
                  />
               </div>

               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume</label>
                    <input
                      name="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition font-bold text-slate-900"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Metric</label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition font-bold text-slate-900"
                    >
                      <option value="kg">kg</option>
                      <option value="tons">tons</option>
                      <option value="units">units</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Status Protocol</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition font-bold text-slate-900"
                  >
                    <option value="active">Active Monitoring</option>
                    <option value="archived">Archived Entry</option>
                    <option value="on_hold">On Hold</option>
                  </select>
               </div>
            </div>
          </div>

          {/* 🌡️ Logic & Environment */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-10">
            <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-slate-100">
               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-indigo-600" />
               </div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Environmental Logs</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temp Range</label>
                    <input
                       name="storage.temperature"
                       value={formData.storageConditions.temperature}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-bold text-slate-900 text-sm"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Humidity %</label>
                    <input
                       name="storage.humidity"
                       value={formData.storageConditions.humidity}
                       onChange={handleChange}
                       className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-bold text-slate-900 text-sm"
                    />
                 </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quality Grade</label>
                  <select
                     name="qualityGrade"
                     value={formData.qualityGrade}
                     onChange={handleChange}
                     className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition font-bold text-slate-900"
                  >
                     <option value="Grade A+">Grade A+ (Elite)</option>
                     <option value="Grade A">Grade A (Premium)</option>
                     <option value="Grade B">Grade B (Standard)</option>
                  </select>
               </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6">
            <div className="text-center md:text-left">
               {error && (
                  <div className="flex items-center text-rose-600 font-bold text-xs animate-shake">
                     <AlertCircle className="w-4 h-4 mr-2" />
                     {error}
                  </div>
               )}
               {success && (
                  <div className="flex items-center text-emerald-600 font-bold text-xs">
                     <CheckCircle className="w-4 h-4 mr-2" />
                     Registry record updated successfully! Returning...
                  </div>
               )}
            </div>
            
            <div className="flex items-center space-x-4">
               <button
                  type="button"
                  onClick={() => navigate(`/farmer/batches/${id}`)}
                  className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition"
               >
                  Cancel Edits
               </button>
               <button
                  type="submit"
                  disabled={saving || success}
                  className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center"
               >
                  {saving ? 'Updating Ledger Record...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Metadata Changes
                    </>
                  )}
               </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditBatch;
