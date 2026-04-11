import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { farmerAPI } from '../../api/farmer';
import { QrCode, Package, Calendar, ShieldCheck, Thermometer, Droplets, ArrowLeft, Edit3, Trash2, CheckCircle, Info, Plus } from 'lucide-react';

function BatchDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState('');
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    loadBatch();
  }, [id]);

  const loadBatch = async () => {
    try {
      const response = await farmerAPI.getBatchById(id);
      if (response.success) {
        setBatch(response.data);
      }
    } catch (error) {
      console.error('Error loading batch:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQRCode = async () => {
    try {
      const response = await farmerAPI.generateQRCode(id);
      if (response.success) {
        setQrCode(response.data.qrCode);
        setShowQR(true);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Registry Sync in progress...</p>
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-[2.5rem] p-12 shadow-2xl text-center border border-slate-200">
           <Info className="w-12 h-12 text-slate-300 mx-auto mb-4" />
           <h2 className="text-2xl font-black text-slate-900 mb-2 mt-4">Record Not Found</h2>
           <p className="text-slate-500 font-medium mb-8">This batch ID does not exist in the decentralized registry.</p>
           <button onClick={() => navigate('/farmer/dashboard')} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px]">Return to Console</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif] pb-20">
      {/* 🏛️ Premium Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
             <button onClick={() => navigate('/farmer/dashboard')} className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-blue-600 mr-2">
                <ArrowLeft className="w-5 h-5" />
             </button>
            <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Batch Intel</h1>
              <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                <span className="text-blue-600 mr-2">●</span> {batch.batchId}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate(`/farmer/batches/${id}/edit`)}
              className="flex items-center px-6 py-2.5 bg-white border-2 border-slate-200 text-slate-600 rounded-xl hover:border-blue-600 hover:text-blue-600 transition shadow-sm"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              <span className="font-bold text-xs uppercase tracking-widest">Edit Entry</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* 📦 Main Logistics Card */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden p-10">
              <div className="flex items-center justify-between mb-10 pb-6 border-b border-slate-100">
                 <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">{batch.productName}</h2>
                    <p className="text-blue-600 text-[10px] font-black uppercase tracking-widest mt-1 italic">Verified Commodity Record</p>
                 </div>
                 <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    batch.status === 'active' || !batch.status ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'
                 }`}>
                    {batch.status || 'active'}
                 </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                 <div className="space-y-8">
                    <div className="flex items-start">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 mt-1 border border-slate-100">
                          <Plus className="w-5 h-5 text-blue-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Volume</p>
                          <p className="text-xl font-black text-slate-900">{batch.quantity} <span className="text-xs text-slate-400 uppercase ml-1">{batch.unit}</span></p>
                       </div>
                    </div>
                    
                    <div className="flex items-start">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 mt-1 border border-slate-100">
                          <Calendar className="w-5 h-5 text-indigo-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Production Timeline</p>
                          <div className="flex items-center gap-4 mt-1">
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Harvest</p>
                                <p className="text-sm font-bold text-slate-800">{new Date(batch.harvestDate).toLocaleDateString()}</p>
                             </div>
                             <div className="w-4 h-px bg-slate-100"></div>
                             <div>
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Expiry</p>
                                <p className="text-sm font-bold text-slate-800">{new Date(batch.expiryDate).toLocaleDateString()}</p>
                             </div>
                          </div>
                       </div>
                    </div>

                    <div className="flex items-start">
                       <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center mr-4 mt-1 border border-slate-100">
                          <ShieldCheck className="w-5 h-5 text-emerald-600" />
                       </div>
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Quality Assurance</p>
                          <div className="flex items-center gap-2 mt-1">
                             <p className="text-sm font-bold text-slate-800">{batch.qualityGrade || 'Standard'}</p>
                             {batch.organicCertified && (
                                <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md">Organic</span>
                             )}
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-8 bg-slate-50/50 p-8 rounded-[2rem] border border-slate-100">
                    <div>
                       <div className="flex items-center text-blue-600 mb-2">
                          <Thermometer className="w-4 h-4 mr-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Storage Environment</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">Temp</p>
                             <p className="text-sm font-black text-slate-800">{batch.storageConditions?.temperature || '4°C'}</p>
                          </div>
                          <div>
                             <p className="text-[9px] font-bold text-slate-400 uppercase">Humidity</p>
                             <p className="text-sm font-black text-slate-800">{batch.storageConditions?.humidity || '65%'}</p>
                          </div>
                       </div>
                    </div>

                    <div>
                       <div className="flex items-center text-indigo-600 mb-2">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Residue Analysis</p>
                       </div>
                       <p className="text-sm font-black text-slate-800">{batch.pesticideResidue || 'None Detected'}</p>
                    </div>

                    {batch.notes && (
                       <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Node Intel</p>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed italic">"{batch.notes}"</p>
                       </div>
                    )}
                 </div>
              </div>
            </div>

            {/* 🔥 Danger Zone - Bottom */}
            <div className="bg-white rounded-[2.5rem] border border-rose-100 p-8 flex items-center justify-between">
                <div>
                  <h3 className="text-rose-900 font-black tracking-tight">Record Decommissioning</h3>
                  <p className="text-slate-500 text-xs font-medium">This action permanently removes the batch from the active tracking network.</p>
                </div>
                <button
                  onClick={async () => {
                    if (window.confirm('WARNING: Are you absolutely sure? This will permanently decommission this batch record.')) {
                      try {
                        await farmerAPI.deleteBatch(id);
                        navigate('/farmer/dashboard');
                      } catch (error) {
                        alert('Operation failed. Connection error.');
                      }
                    }
                  }}
                  className="bg-white border-2 border-rose-200 text-rose-600 px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all"
                >
                  Delete Record
                </button>
            </div>
          </div>

          {/* 📡 Distribution Terminal */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2.5rem] border border-slate-200 p-10 shadow-sm sticky top-24">
              <div className="text-center mb-10">
                 <div className="w-16 h-16 bg-blue-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-blue-100">
                    <QrCode className="w-8 h-8 text-blue-600" />
                 </div>
                 <h3 className="text-xl font-black text-slate-900 tracking-tight">Identity & Trace</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Public Distribution Gate</p>
              </div>

              {!showQR ? (
                <button
                  onClick={handleGenerateQRCode}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-slate-200 hover:bg-blue-600 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center group"
                >
                  <QrCode className="w-4 h-4 mr-3 group-hover:rotate-12 transition-transform" />
                  Generate Public QR
                </button>
              ) : (
                <div className="space-y-6 animate-in zoom-in-95 duration-500">
                   <div className="relative group overflow-hidden rounded-[2rem] border-2 border-blue-100 p-4 bg-slate-50 transition-all hover:bg-white hover:border-blue-500">
                      <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity"></div>
                      <img src={qrCode} alt="Batch QR" className="w-full aspect-square object-contain mix-blend-multiply" />
                   </div>
                   <div className="bg-blue-50 border border-blue-100 p-6 rounded-2xl">
                      <p className="text-xs font-black text-blue-700 uppercase tracking-widest mb-3 flex items-center">
                         <Info className="w-3.5 h-3.5 mr-2" />
                         Public Gateway Info
                      </p>
                      <p className="text-[11px] text-blue-600 font-bold leading-relaxed">
                         Scan this code to instantly access the public traceability portal for this batch. 
                         Verified by the AgriTrace Enterprise Protocol.
                      </p>
                   </div>
                   <button onClick={() => setShowQR(false)} className="w-full text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                      Regenerate Gateway Identity
                   </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default BatchDetail;