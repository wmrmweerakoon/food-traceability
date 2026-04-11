import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white font-['Outfit',sans-serif] overflow-hidden">
      {/* 🌿 Left Column: Narrative Showcase */}
      <div className="hidden lg:flex relative flex-col justify-between p-16 text-white overflow-hidden">
        {/* Organic Texture Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src={`C:/Users/ruvis/.gemini/antigravity/brain/2a47f4ad-8bc4-41a9-89be-377b0d98b15a/premium_organic_texture_1775884785308.png`}
            alt="Organic Texture"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-transparent opacity-80"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center space-x-3 mb-12 group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-500">
              <LogIn className="w-6 h-6 text-emerald-900" />
            </div>
            <span className="text-2xl font-black tracking-tighter">AgriTrace.</span>
          </Link>
          
          <h2 className="text-6xl font-black tracking-tight leading-[1.1] mb-6">
            From Soil <br />
            <span className="text-emerald-400 font-outline">to Store.</span>
          </h2>
          <p className="max-w-md text-lg text-emerald-50 font-medium opacity-90 leading-relaxed">
            Revolutionizing food traceability with a decentralized node system designed for producers, distributors, and citizens.
          </p>
        </div>

        <div className="relative z-10">
          <div className="flex items-center space-x-8 opacity-60">
            <div className="text-center">
              <p className="text-2xl font-black">100%</p>
              <p className="text-[10px] uppercase font-black tracking-widest">Visibility</p>
            </div>
            <div className="h-10 w-px bg-white/20"></div>
            <div className="text-center">
              <p className="text-2xl font-black">2.0</p>
              <p className="text-[10px] uppercase font-black tracking-widest">Network</p>
            </div>
          </div>
        </div>
      </div>

      {/* 🚪 Right Column: Action Portal */}
      <div className="flex items-center justify-center relative p-8 bg-slate-50 lg:bg-white overflow-y-auto">
        {/* Faint Organic Pattern Overlay (lg only) */}
        <div className="hidden lg:block absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 C 20 10, 0 30, 20 40 S 40 20, 50 30 S 30 50, 60 60 S 80 40, 80 50' stroke='%23059669' fill='none' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E")` }}></div>
        
        <div className="max-w-md w-full relative z-10">
          <div className="bg-white lg:bg-transparent rounded-[2.5rem] p-10 lg:p-0 shadow-2xl shadow-slate-200 lg:shadow-none border border-slate-100 lg:border-none">
            <div className="mb-10 lg:text-left text-center">
              <div className="lg:hidden inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4 border border-emerald-100">
                <LogIn className="w-8 h-8 text-emerald-700" />
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Welcome Back.</h1>
              <p className="text-slate-600 font-bold">Sign in to your account</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold animate-shake">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-bold placeholder:text-slate-400 text-slate-900"
                  placeholder="kasun.perera@agritrace.lk"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-bold placeholder:text-slate-400 text-slate-900"
                  placeholder="••••••••"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-10 lg:text-left text-center">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-[11px]">
                New to AgriTrace?{' '}
                <Link to="/register" className="text-emerald-700 hover:text-emerald-800 transition-colors ml-1 font-black underline underline-offset-4 decoration-2">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
          
          <p className="hidden lg:block mt-12 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] opacity-40">
            AgriTrace Global Node v2.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

