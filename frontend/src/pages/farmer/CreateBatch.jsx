import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { farmerAPI } from '../../api/farmer';
import { Package, Calendar, ShieldCheck, Thermometer, Droplets, ArrowLeft, Save, Plus, AlertCircle, CheckCircle } from 'lucide-react';

function CreateBatch() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    productName: '',
    harvestDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    quantity: '',
    unit: 'kg',
    qualityGrade: 'A',
    organicCertified: false,
    pesticideResidue: 'None',
    storageConditions: {
      temperature: '4°C',
      humidity: '65%',
      otherConditions: 'Dry & Cool',
    },
    notes: '',
  });

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
    setLoading(true);
    setError('');

    try {
      const response = await farmerAPI.createBatch(formData);
      if (response.success) {
        setSuccess(true);
        setTimeout(() => navigate('/farmer/dashboard'), 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create batch. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif] pb-20">
      {/* 🏛️ Premium Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <button onClick={() => navigate('/farmer/dashboard')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-emerald-600 mr-2">
                <ArrowLeft className="w-5 h-5" />
             </button>
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Plus className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Log New Harvest</h1>
              <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                <span className="text-emerald-600 mr-2">●</span> Agriculture Production Node
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-10">
        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* 📦 Core Logistics Card */}
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
                    placeholder="e.g. Organic Cavendish Bananas"
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
                      placeholder="500"
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
                      <option value="kg">kilograms (kg)</option>
                      <option value="liters">liters (L)</option>
                      <option value="pieces">pieces (pcs)</option>
                      <option value="lbs">pounds (lbs)</option>
                      <option value="gallons">gallons (gal)</option>
                    </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Harvest Timestamp</label>
                  <div className="relative">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input
                        name="harvestDate"
                        type="date"
                        value={formData.harvestDate}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition font-bold text-slate-900"
                        required
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Registry Expiry Date</label>
                  <div className="relative">
                     <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                     <input
                        name="expiryDate"
                        type="date"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 pl-12 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition font-bold text-slate-900"
                        required
                     />
                  </div>
               </div>
            </div>
          </div>

          {/* 🌡️ Environment & Quality Card */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-10">
            <div className="flex items-center space-x-3 mb-10 pb-6 border-b border-slate-100">
               <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
               </div>
               <h2 className="text-xl font-black text-slate-900 tracking-tight">Quality & Storage Protocols</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
               <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Temp Protocol</label>
                       <input
                          name="storage.temperature"
                          value={formData.storageConditions.temperature}
                          onChange={handleChange}
                          placeholder="4°C"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-bold text-slate-900 text-sm"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Humidity</label>
                       <input
                          name="storage.humidity"
                          value={formData.storageConditions.humidity}
                          onChange={handleChange}
                          placeholder="65%"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-bold text-slate-900 text-sm"
                       />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quality Grading</label>
                    <select
                      name="qualityGrade"
                      value={formData.qualityGrade}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-bold text-slate-900"
                    >
                      <option value="Premium">Premium Export</option>
                      <option value="A">Grade A (Choice)</option>
                      <option value="B">Grade B (Standard)</option>
                      <option value="C">Grade C (Substandard)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pesticide Analysis</label>
                    <select
                      name="pesticideResidue"
                      value={formData.pesticideResidue}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-bold text-slate-900"
                    >
                      <option value="None">None (Organic Standard)</option>
                      <option value="Low">Low Residue</option>
                      <option value="Moderate">Moderate Residue</option>
                      <option value="High">High Residue</option>
                    </select>
                  </div>

                  <div className="flex items-center space-x-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 select-none cursor-pointer hover:bg-white transition-all group" onClick={() => setFormData(p => ({...p, organicCertified: !p.organicCertified}))}>
                     <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.organicCertified ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200'}`}>
                        {formData.organicCertified && <CheckCircle className="w-4 h-4" />}
                     </div>
                     <span className="text-[11px] font-black text-slate-600 uppercase tracking-[0.1em] group-hover:text-slate-900">Organic Certification Verified</span>
                  </div>
               </div>

               <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Notes</label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      placeholder="Add any specific handling instructions or harvest details..."
                      className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition font-medium text-slate-900 min-h-[160px] text-sm"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Submission Control */}
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
                     Batch logged successfully! Syncing with registry...
                  </div>
               )}
            </div>
            
            <div className="flex items-center space-x-4">
               <button
                  type="button"
                  onClick={() => navigate('/farmer/dashboard')}
                  className="px-8 py-4 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:text-slate-600 transition"
               >
                  Discard Entry
               </button>
               <button
                  type="submit"
                  disabled={loading || success}
                  className="bg-emerald-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center"
               >
                  {loading ? 'Initializing Blockchain Entry...' : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Commit Harvest Data
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

export default CreateBatch;
