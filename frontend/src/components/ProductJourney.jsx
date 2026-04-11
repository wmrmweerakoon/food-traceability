import { ShieldCheck, MapPin, Store, Calendar, Package, ArrowRight, CornerRightDown, Truck } from 'lucide-react';

function ProductJourney({ traceabilityData }) {
  if (!traceabilityData) return null;

  const stages = [
    {
      id: 'harvest',
      title: 'Harvest & Packing',
      subtitle: 'THE JOURNEY BEGINS AT THE SOURCE',
      icon: Package,
      data: traceabilityData.batch,
      date: traceabilityData.batch?.harvestDate,
    },
    {
      id: 'transport',
      title: 'Secure Transport',
      subtitle: 'MOVING THROUGH THE LOGISTICS NETWORK',
      icon: Truck,
      data: traceabilityData.transport,
      date: traceabilityData.transport?.departureDate,
    },
    {
      id: 'retail',
      title: 'Retail Store',
      subtitle: 'ARRIVED AT YOUR LOCAL MERCHANT',
      icon: Store,
      data: traceabilityData.inventory,
      date: traceabilityData.inventory?.receivedDate,
    }
  ];

  return (
    <div className="bg-white rounded-[2.5rem] p-10 lg:p-14 border border-slate-100 shadow-sm relative overflow-hidden font-['Outfit',sans-serif]">
      {/* Structural Branding */}
      <div className="flex items-center space-x-2 mb-12 px-2">
        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">Verified Integrity Chain</p>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-20 px-2">
        <h2 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter">Product Timeline</h2>
        
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-3xl flex items-center space-x-6">
           <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100">
             <QrCodeIcon className="w-6 h-6 text-blue-600" />
           </div>
           <div>
              <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">Tracking ID</p>
              <p className="text-base font-black text-slate-900 tracking-tight">{traceabilityData.batch?.batchId || 'N/A'}</p>
           </div>
        </div>
      </div>

      <div className="relative">
        {/* The Hub-and-Spoke vertical line */}
        <div className="absolute left-[2.25rem] top-0 bottom-0 w-[2px] bg-slate-50"></div>

        <div className="space-y-16">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = !!stage.data;
            
            return (
              <div key={stage.id} className="relative group">
                <div className="flex items-start">
                  {/* Point Indicator */}
                  <div className={`relative z-10 w-[4.5rem] h-[4.5rem] rounded-2xl flex items-center justify-center transition-all duration-700 shadow-xl ${
                    isCompleted ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-50 text-slate-300 shadow-transparent'
                  }`}>
                    <Icon className="w-8 h-8" />
                    {isCompleted && (
                       <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>

                  <div className="ml-10 pt-2 flex-grow">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                       <div>
                          <h3 className={`text-2xl font-black tracking-tight leading-none ${isCompleted ? 'text-slate-900' : 'text-slate-300'}`}>
                            {stage.title}
                          </h3>
                          <p className="text-xs font-black text-slate-500 uppercase tracking-[2px] mt-2 italic">{stage.subtitle}</p>
                       </div>
                       {isCompleted && (
                          <div className="bg-emerald-500 text-white px-5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-200">Completed</div>
                       )}
                    </div>

                    <div className="transition-all duration-700">
                      {isCompleted ? (
                        <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-500">
                          {stage.id === 'harvest' && (
                            <div className="space-y-10">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 pb-8 border-b border-slate-100">
                                <div className="space-y-1">
                                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Product</p>
                                  <p className="text-base font-black text-slate-900">{stage.data.productName}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Quantity</p>
                                  <p className="text-base font-black text-slate-900">{stage.data.quantity} {stage.data.unit}</p>
                                </div>
                                 <div className="space-y-1 text-right">
                                  <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Registry Entry</p>
                                  <div className="flex items-center justify-end text-sm font-bold text-slate-800">
                                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                    {new Date(stage.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </div>
                                </div>
                              </div>

                              {/* 🕵️‍♂️ Production Intel - Expanded Details */}
                              <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-8 space-y-8">
                                <div className="flex items-center space-x-2 pb-4 border-b border-slate-200">
                                   <ShieldCheck className="w-5 h-5 text-blue-600" />
                                   <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest leading-none">Production Intel & Compliance</h4>
                                </div>
                                
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                                  <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">Harvest Date</p>
                                    <p className="text-sm font-black text-slate-900">
                                      {stage.data.harvestDate ? new Date(stage.data.harvestDate).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">Quality Rating</p>
                                    <p className="text-sm font-black text-slate-900">{stage.data.qualityGrade || 'Verified Grade'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">Registry Expiry</p>
                                    <p className="text-sm font-black text-slate-900">
                                      {stage.data.expiryDate ? new Date(stage.data.expiryDate).toLocaleDateString() : 'Active Batch'}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">Pesticide Analysis</p>
                                    <p className="text-sm font-black text-emerald-600 uppercase tracking-tighter">{stage.data.pesticideResidue || 'None Detected'}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">Storage Strategy</p>
                                    <p className="text-sm font-black text-slate-900">
                                      {stage.data.storageConditions?.temperature || '4°C'} | {stage.data.storageConditions?.humidity || '65% RH'}
                                    </p>
                                  </div>
                                </div>

                                {stage.data.organicCertified && (
                                   <div className="flex items-center space-x-2 text-emerald-600">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                      <span className="text-xs font-black uppercase tracking-widest italic">Organic Certification Verified</span>
                                   </div>
                                )}

                                {stage.data.notes && (
                                  <div className="pt-6 border-t border-slate-200">
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Origin Notes</p>
                                    <p className="text-sm font-medium text-slate-700 leading-relaxed italic">"{stage.data.notes}"</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {stage.id === 'transport' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                              <div className="space-y-1">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Origin</p>
                                <div className="flex items-start">
                                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-slate-400" />
                                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{stage.data.origin?.locationName || 'Distribution Center'}</p>
                                </div>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Destination</p>
                                <div className="flex items-start">
                                  <MapPin className="w-5 h-5 mr-3 mt-0.5 text-blue-600" />
                                  <p className="text-sm font-bold text-slate-800 leading-relaxed">{stage.data.destination?.locationName || 'Retail Hub'}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {stage.id === 'retail' && (
                            <div className="flex items-center space-x-6">
                              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center border border-blue-100">
                                <Store className="w-7 h-7 text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Store Branch</p>
                                <p className="text-xl font-black text-slate-900">{stage.data.storeName || 'Verified Merchant'}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3 text-slate-300 opacity-50 px-2">
                          <div className="w-12 h-px bg-slate-200"></div>
                          <p className="text-xs font-black uppercase tracking-[0.2em] italic">Awaiting Verification Entry</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Icon Helper for the Header
function QrCodeIcon({ className }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7"></rect>
      <rect x="14" y="3" width="7" height="7"></rect>
      <rect x="14" y="14" width="7" height="7"></rect>
      <rect x="3" y="14" width="7" height="7"></rect>
    </svg>
  );
}

export default ProductJourney;
