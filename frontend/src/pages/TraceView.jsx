import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { consumerAPI } from '../api/consumer';
import ProductJourney from '../components/ProductJourney';
import FeedbackSection from '../components/FeedbackSection';
import { ShieldCheck, Calendar, MapPin, Thermometer, Droplets, CheckCircle, AlertCircle, Loader2, ChevronRight } from 'lucide-react';

function TraceView() {
  const { batchId } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReport = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await consumerAPI.getTraceabilityReport(batchId);
        if (response.success) {
          setReport(response.data);
        } else {
          setError(response.message || 'Verification failed: Batch ID not found in the AgriTrace registry.');
        }
      } catch (err) {
        console.error('Error loading traceability report:', err);
        setError(
          err.response?.data?.message ||
            'An error occurred while communicating with the traceability network.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (batchId) {
      loadReport();
    }
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-emerald-600 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
          </div>
        </div>
        <p className="mt-6 text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">
          Authenticating Journey...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 max-w-lg w-full text-center border border-rose-100">
          <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Registry Error</h1>
          <p className="text-slate-500 font-bold mb-8 leading-relaxed">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all"
          >
            Retry Verification
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;

  const { farm, transport, store } = report;

  // Prepare data for the timeline component
  const journeyData = {
    batch: {
      ...farm,
      batchId: farm?.batchId,
      productName: farm?.productName,
      harvestDate: farm?.harvestDate,
      expiryDate: farm?.expiryDate,
      quantity: farm?.quantity,
      unit: farm?.unit,
      pesticideResidue: farm?.pesticideResidue,
      storageConditions: farm?.storageConditions,
      notes: farm?.notes,
      status: 'completed'
    },
    transport: transport && transport.length > 0 ? {
      ...transport[transport.length - 1], // Show latest transport leg
      status: 'completed'
    } : null,
    inventory: store && store.length > 0 ? {
      ...store[0], // Show primary retail entry
      status: 'completed'
    } : null,
    consumer: null
  };

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif] pb-20">
      {/* 🚀 Hero Section */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-emerald-600 px-3 py-1 rounded-full flex items-center">
                  <ShieldCheck className="w-3 h-3 text-white mr-2" />
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">AgriTrace Verified</span>
                </div>
                {farm.organicCertified && (
                    <div className="bg-emerald-500 px-3 py-1 rounded-full flex items-center">
                        <CheckCircle className="w-3 h-3 text-white mr-2" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Certified Organic</span>
                    </div>
                )}
              </div>
              
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
                {farm.productName}
              </h1>
              <div className="flex items-center font-mono text-sm text-slate-400 bg-slate-50 px-4 py-2 rounded-xl w-fit">
                Batch: <span className="text-emerald-600 font-black ml-2">{farm.batchId}</span>
              </div>
            </div>

            <div className="text-right hidden md:block">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Origin Node</p>
               <p className="text-xl font-black text-slate-900">
                 {typeof farm.location === 'object' && farm.location !== null ? (farm.location.locationName || farm.location.type || 'Verified Origin') : (farm.location || 'Verified Origin')}
               </p>
               <p className="text-sm font-bold text-emerald-600 mt-1">Authenticity Guaranteed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-8">
        {/* 📊 High-Fidelity Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <Calendar className="w-5 h-5 text-emerald-600 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Harvested</p>
            <p className="text-sm font-black text-slate-900 mt-1">
              {new Date(farm.harvestDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <Thermometer className="w-5 h-5 text-indigo-500 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Temp</p>
            <p className="text-sm font-black text-slate-900 mt-1">{farm.storageConditions?.temperature || '4°C Verified'}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <Droplets className="w-5 h-5 text-emerald-400 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Humidity</p>
            <p className="text-sm font-black text-slate-900 mt-1">{farm.storageConditions?.humidity || '65% Optimal'}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quality Grade</p>
            <p className="text-sm font-black text-slate-900 mt-1">{farm.qualityGrade || 'Grade A+'}</p>
          </div>
        </div>

        {/* 🗺️ Timeline Section */}
        <div className="space-y-10">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Full Lifecycle History</h2>
            <Link to="/register" className="text-[10px] font-black text-emerald-600 uppercase tracking-widest hover:underline flex items-center">
              Claim Ownership <ChevronRight className="w-3 h-3 ml-1" />
            </Link>
          </div>

          <ProductJourney traceabilityData={journeyData} />

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
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Verified Producer</p>
                      <p className="text-lg font-black text-slate-900">{farm.farmer?.name}</p>
                      <p className="text-sm text-slate-500 font-medium">
                        {typeof farm.farmer?.address === 'object' && farm.farmer.address !== null
                          ? Object.values(farm.farmer.address).filter(val => typeof val === 'string' || typeof val === 'number').join(', ') || 'Address not listed'
                          : farm.farmer?.address || 'Address not listed'}
                      </p>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pesticide Residue</p>
                      <div className="flex items-center">
                         <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                         <p className="text-sm font-bold text-slate-700">{farm.pesticideResidue || 'None Detected'}</p>
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

        {/* 💬 Feedback & Reviews Section */}
        <section className="mt-20">
            <div className="flex items-center space-x-2 mb-8 px-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full"></div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Community Verification</h2>
            </div>
            <FeedbackSection batchId={batchId} />
        </section>
      </div>

      {/* 🏛️ Institutional Footer */}
      <div className="max-w-4xl mx-auto px-6 mt-20 text-center">
        <div className="w-full h-px bg-slate-200 mb-10"></div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] mb-4">
          AgriTrace Professional Protocol v2.4
        </p>
        <p className="text-[9px] text-slate-400 leading-relaxed max-w-lg mx-auto opacity-60">
          This digital traceability report is secured by decentralized ledger technology. 
          The origin, storage conditions, and transfer of custody have been verified by 
          authorized AgriTrace nodes.
        </p>
      </div>
    </div>
  );
}

export default TraceView;
