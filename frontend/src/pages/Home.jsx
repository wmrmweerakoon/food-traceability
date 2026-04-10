import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Leaf, 
  Truck, 
  Store, 
  Search, 
  ChevronRight, 
  CheckCircle, 
  ShieldCheck, 
  Clock,
  ArrowRight
} from 'lucide-react';

function Home() {
  const [batchId, setBatchId] = useState('');
  const navigate = useNavigate();

  const handleTrace = (e) => {
    e.preventDefault();
    if (batchId.trim()) {
      navigate(`/trace/${batchId.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white font-['Outfit',sans-serif] text-slate-900 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
              <Leaf className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
              AgriTrace
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-emerald-600 transition">How it Works</a>
            <a href="#features" className="hover:text-emerald-600 transition">Features</a>
            <Link to="/login" className="hover:text-emerald-600 transition">Sign In</Link>
            <Link to="/register" className="px-5 py-2.5 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition shadow-md">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold mb-6 animate-fade-in">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>
                Web3 Powered Traceability
              </div>
              <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                Transparent <span className="text-emerald-600">Farm-to-Table</span> Journey.
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-lg">
                Empowering consumers with real-time data on food origin, quality, and transportation. 
                Build trust through complete visibility.
              </p>

              {/* Quick Trace Search */}
              <div className="relative max-w-md group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <form onSubmit={handleTrace} className="relative flex bg-white rounded-xl shadow-xl p-2 border border-slate-100">
                  <div className="flex-1 flex items-center px-4">
                    <Search className="w-5 h-5 text-slate-400 mr-3" />
                    <input 
                      type="text" 
                      placeholder="Enter Batch ID to Trace..."
                      className="w-full bg-transparent border-none focus:ring-0 text-slate-700 placeholder-slate-400"
                      value={batchId}
                      onChange={(e) => setBatchId(e.target.value)}
                    />
                  </div>
                  <button 
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold transition flex items-center shadow-lg shadow-emerald-200"
                  >
                    Trace <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </form>
              </div>
              
              <div className="mt-8 flex items-center space-x-6 text-sm text-slate-400">
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> Farmers</span>
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> Distributors</span>
                <span className="flex items-center"><CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> Consumers</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-emerald-200/40 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-teal-200/40 rounded-full blur-3xl"></div>
              <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/10 transform rotate-2 hover:rotate-0 transition duration-700 group">
                <img 
                  src="/home-hero.png" 
                  alt="AgriTrace Hero" 
                  className="w-full h-auto object-cover scale-105 group-hover:scale-100 transition duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">500+</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Farmers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">10k+</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Batches Traced</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">100%</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Verifiable</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-slate-900 mb-1">0%</div>
              <div className="text-slate-500 text-sm font-medium uppercase tracking-wider">Data Loss</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-3">Seamless Process</h2>
            <h3 className="text-4xl font-extrabold text-slate-900">How AgriTrace Works</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Step 1 */}
            <div className="relative z-10 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8 text-emerald-600" />
              </div>
              <h4 className="text-xl font-bold mb-4">Production</h4>
              <p className="text-slate-600 mb-6">Farmers log harvest details, quality data, and generate unique QR codes for every batch.</p>
              <div className="text-slate-300 font-black text-6xl absolute top-6 right-8 opacity-20 italic">01</div>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Truck className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold mb-4">Logistics</h4>
              <p className="text-slate-600 mb-6">Every transport leg is recorded with temperature logs and time-stamped location updates.</p>
              <div className="text-slate-300 font-black text-6xl absolute top-6 right-8 opacity-20 italic">02</div>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition duration-300">
              <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                <Store className="w-8 h-8 text-amber-600" />
              </div>
              <h4 className="text-xl font-bold mb-4">Retail & Scan</h4>
              <p className="text-slate-600 mb-6">Consumers scan the QR code to see the full journey and verified quality reports.</p>
              <div className="text-slate-300 font-black text-6xl absolute top-6 right-8 opacity-20 italic">03</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-slate-900 text-white rounded-[3rem] mx-4 lg:mx-8 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-3">Enterprise Grade</h2>
              <h3 className="text-4xl lg:text-5xl font-extrabold mb-8 leading-tight">Advanced Features for Your Food Business.</h3>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                We provide the tools you need to comply with modern food safety standards and build customer loyalty.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-emerald-500/10 rounded-lg"><ShieldCheck className="w-6 h-6 text-emerald-400" /></div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Verifiable Quality</h5>
                    <p className="text-slate-500">Every claim is backed by immutable data records.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="mr-4 p-2 bg-blue-500/10 rounded-lg"><Clock className="w-6 h-6 text-blue-400" /></div>
                  <div>
                    <h5 className="font-bold text-lg mb-1">Real-time Visibility</h5>
                    <p className="text-slate-500">Know exactly where your product is, at any time.</p>
                  </div>
                </div>
              </div>

              <div className="mt-12 flex space-x-4">
                <Link to="/register" className="px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-400 transition flex items-center shadow-lg shadow-emerald-500/20">
                  Join the Network <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4 pt-12">
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                  <div className="text-emerald-400 font-bold mb-2">QR Tech</div>
                  <div className="text-slate-200">Instant generation for batches.</div>
                </div>
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                  <div className="text-blue-400 font-bold mb-2">Maps API</div>
                  <div className="text-slate-200">Interactive journey visualization.</div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-emerald-600 p-8 rounded-3xl shadow-xl shadow-emerald-600/20">
                  <div className="text-white font-bold mb-2">Insights</div>
                  <div className="text-emerald-50">Predictive shelf-life analysis.</div>
                </div>
                <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700">
                  <div className="text-amber-400 font-bold mb-2">Scalable</div>
                  <div className="text-slate-200">Ready for global supply chains.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <Leaf className="text-emerald-600 w-6 h-6" />
            <span className="text-lg font-bold text-slate-900 leading-none">AgriTrace</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 AgriTrace Project. Built for agricultural transparency.</p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
