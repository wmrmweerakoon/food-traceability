import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consumerAPI } from '../../api/consumer';
import ProductJourney from '../../components/ProductJourney';
import QRScannerModal from '../../components/QRScannerModal';
import FeedbackSection from '../../components/FeedbackSection';
import { 
  Search, QrCode, Clock, Package, Loader2, Info, 
  ShieldCheck, Calendar, MapPin, Thermometer, Droplets, CheckCircle, ChevronRight 
} from 'lucide-react';

function ConsumerDashboard() {
  const { user } = useAuth();
  const [batchId, setBatchId] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [traceabilityData, setTraceabilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e, id = batchId) => {
    if (e) e.preventDefault();
    if (!id.trim()) {
      setError('Please enter a batch ID');
      return;
    }

    setLoading(true);
    setError('');
    setTraceabilityData(null);

    try {
      const response = await consumerAPI.getTraceabilityReport(id.trim());
      if (response.success) {
        setTraceabilityData(response.data);
      } else {
        setError(response.message || 'Batch record not detected in the integrity chain.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Traceability query failed. Local connection interrupted.');
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = (decodedId) => {
    // QR data might be a full URL, extract the BATCH-ID part
    const parts = decodedId.split('/');
    const cleanId = parts[parts.length - 1];
    
    setBatchId(cleanId);
    setShowScanner(false);
    handleSearch(null, cleanId); // Trigger search automatically
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif] pb-20">
      {/* 🏛️ Premium Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <Package className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Consumer Hub</h1>
              <div className="flex items-center text-slate-500 text-[10px] font-black uppercase tracking-widest mt-0.5">
                <span className="text-emerald-600 mr-2">●</span> {user?.firstName} {user?.lastName} Dashboard
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
               onClick={() => setShowScanner(true)}
               className="flex items-center px-6 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-black transition-all transform hover:scale-105 shadow-xl shadow-slate-200"
            >
               <QrCode className="w-4 h-4 mr-2" />
               <span className="font-bold text-[10px] uppercase tracking-widest">Scan Product</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* 🕵️‍♂️ Trace Center - Search Hero */}
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-10 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50/50 rounded-full blur-3xl -mr-20 -mt-20"></div>
           
           <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Trace Your Food</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Enter your tracking ID or use the scanner to verify the origin chain.</p>
              </div>

              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                 <div className="relative flex-grow">
                   <input
                      type="text"
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl p-5 pl-14 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition font-bold text-slate-900 placeholder:text-slate-300"
                      placeholder="e.g. BATCH-17758..."
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                   />
                   <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                 </div>
                 <button 
                   type="submit"
                   disabled={loading}
                   className="bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                 >
                   {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Trace Origin'}
                 </button>
              </form>
           </div>
        </div>

        {/* 🆘 Error Display */}
        {error && (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-top-4 duration-500">
            <div className="bg-rose-50 border border-rose-100 text-rose-700 px-6 py-4 rounded-2xl flex items-center shadow-sm">
              <Info className="w-5 h-5 mr-3 flex-shrink-0" />
              <p className="text-xs font-black uppercase tracking-widest">{error}</p>
            </div>
          </div>
        )}

        {/* Product Journey Result */}
        <div className="transition-all duration-700">
          {traceabilityData ? (
            <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 space-y-10">
              {/* 📊 High-Fidelity Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <Calendar className="w-5 h-5 text-emerald-600 mb-3" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Harvested</p>
                  <p className="text-sm font-black text-slate-900 mt-1">
                    {new Date(traceabilityData.farm.harvestDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <Thermometer className="w-5 h-5 text-indigo-500 mb-3" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Storage Temp</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{traceabilityData.farm.storageConditions?.temperature || '4°C Verified'}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <Droplets className="w-5 h-5 text-emerald-400 mb-3" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Humidity</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{traceabilityData.farm.storageConditions?.humidity || '65% Optimal'}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-500 mb-3" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Quality Grade</p>
                  <p className="text-sm font-black text-slate-900 mt-1">{traceabilityData.farm.qualityGrade || 'Grade A+'}</p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Full Lifecycle History</h2>
                </div>
                
                <ProductJourney 
                  traceabilityData={{
                    batch: {
                      ...traceabilityData.farm,
                      batchId: traceabilityData.farm?.batchId,
                      productName: traceabilityData.farm?.productName,
                      harvestDate: traceabilityData.farm?.harvestDate,
                      expiryDate: traceabilityData.farm?.expiryDate,
                      quantity: traceabilityData.farm?.quantity,
                      unit: traceabilityData.farm?.unit,
                      pesticideResidue: traceabilityData.farm?.pesticideResidue,
                      storageConditions: traceabilityData.farm?.storageConditions,
                      notes: traceabilityData.farm?.notes,
                      status: 'completed'
                    },
                    transport: traceabilityData.transport?.[traceabilityData.transport.length - 1] || null,
                    inventory: traceabilityData.store?.[0] || null,
                    consumer: null
                  }} 
                />

                {/* 🌿 Farm Details Card */}
                <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm">
                  <div className="flex items-center space-x-3 mb-8">
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-emerald-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">Origin Verification</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Verified Producer</p>
                            <p className="text-lg font-black text-slate-900">{traceabilityData.farm.farmer?.name}</p>
                            <p className="text-sm text-slate-500 font-medium">
                              {typeof traceabilityData.farm.farmer?.address === 'object' && traceabilityData.farm.farmer.address !== null
                                ? Object.values(traceabilityData.farm.farmer.address).filter(val => typeof val === 'string' || typeof val === 'number').join(', ') || 'Address not listed'
                                : traceabilityData.farm.farmer?.address || 'Address not listed'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Pesticide Residue</p>
                            <div className="flex items-center">
                              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                              <p className="text-sm font-bold text-slate-700">{traceabilityData.farm.pesticideResidue || 'None Detected'}</p>
                            </div>
                        </div>
                      </div>
                      <div className="bg-slate-50 rounded-[2rem] p-6 border border-slate-100">
                        <p className="text-sm font-bold text-slate-600 mb-4 italic leading-relaxed">
                            "Our farm implements regenerative agriculture protocols to ensure soil health and maximum nutrient density in every harvest."
                        </p>
                        <div className="flex items-center text-xs font-black text-emerald-600 uppercase tracking-widest">
                            <CheckCircle className="w-3 h-3 mr-2" />
                            Inspector Verified
                        </div>
                      </div>
                  </div>
                </div>
              </div>

              {/* 💬 Feedback Section */}
              <section className="mt-16 border-t border-slate-200 pt-16">
                 <FeedbackSection batchId={traceabilityData.farm.batchId} />
              </section>
            </div>
          ) : !loading && (
            <div className="bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 p-20 text-center">
              <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-slate-500 font-bold mb-1">Awaiting Trace Entry</p>
              <p className="text-slate-400 text-sm">Input a batch ID in the Trace Center to begin verification.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      <div className="max-w-7xl mx-auto px-6 pb-20 text-center">
        <p className="text-slate-400 font-black uppercase tracking-[0.6em] text-[10px] opacity-30">
          AgriTrace Global Intelligence Network
        </p>
      </div>

      {/* 📸 Live Scan Terminal Overlay */}
      {showScanner && (
        <QRScannerModal 
          onScanSuccess={handleScanSuccess} 
          onClose={() => setShowScanner(false)} 
        />
      )}
    </div>
  );
}

export default ConsumerDashboard;
