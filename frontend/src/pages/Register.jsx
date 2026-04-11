import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, LogIn } from 'lucide-react';

const ROLES = {
  FARMER: 'ROLE_FARMER',
  DISTRIBUTOR: 'ROLE_DISTRIBUTOR',
  RETAILER: 'ROLE_RETAILER',
  CONSUMER: 'ROLE_CONSUMER',
};

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    contactNumber: '',
    role: ROLES.CONSUMER,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
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

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await register(registerData);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Registration failed. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to connect to server. Make sure the backend is running.');
    } finally {
      setLoading(false);
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
            className="w-full h-full object-cover scale-110 rotate-180"
          />
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-[2px]"></div>
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900 via-transparent to-transparent opacity-80"></div>
        </div>

        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3 mb-12 group">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
              <LogIn className="w-6 h-6 text-emerald-900 rotate-180" />
            </div>
            <span className="text-2xl font-black tracking-tighter">AgriTrace.</span>
          </Link>
          
          <h2 className="text-6xl font-black tracking-tight leading-[1.1] mb-6">
            Global Food <br />
            <span className="text-emerald-400 font-outline text-5xl">Integrity.</span>
          </h2>
          <p className="max-w-md text-lg text-emerald-50 font-medium opacity-90 leading-relaxed">
            Join thousands of producers and distributors in a secure, transparent food network powered by decentralized trust.
          </p>
        </div>

        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-8 max-w-sm">
            <div>
              <p className="text-3xl font-black">5.2k+</p>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Active Nodes</p>
            </div>
            <div>
              <p className="text-3xl font-black">99.9%</p>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-60">Verified Origin</p>
            </div>
          </div>
        </div>
      </div>

      {/* 📝 Right Column: Action Portal */}
      <div className="flex items-center justify-center relative p-8 bg-slate-50 lg:bg-white overflow-y-auto">
        {/* Faint Organic Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 0 C 20 10, 0 30, 20 40 S 40 20, 50 30 S 30 50, 60 60 S 80 40, 80 50' stroke='%23059669' fill='none' stroke-width='0.5' opacity='0.5'/%3E%3C/svg%3E")` }}></div>
        
        <div className="max-w-xl w-full relative z-10 py-12">
          <div className="bg-white lg:bg-transparent rounded-[3rem] p-8 lg:p-0 shadow-2xl shadow-slate-200 lg:shadow-none border border-slate-100 lg:border-none">
            <div className="mb-10 lg:text-left text-center">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Create Account.</h1>
              <p className="text-slate-600 font-bold">Create your AgriTrace account</p>
            </div>
  
            {error && (
              <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm font-bold flex items-center animate-shake">
                <span className="w-2 h-2 bg-rose-500 rounded-full mr-3"></span>
                {error}
              </div>
            )}
  
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="firstName" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-bold placeholder:text-slate-400 text-slate-900"
                    placeholder="Kasun"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-bold placeholder:text-slate-400 text-slate-900"
                    placeholder="Perera"
                  />
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-bold placeholder:text-slate-400 text-slate-900"
                    placeholder="kasun_p"
                  />
                </div>
                <div>
                  <label htmlFor="contactNumber" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-bold placeholder:text-slate-400 text-slate-900"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>
  
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
                <label htmlFor="role" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                  Your Role
                </label>
                <div className="relative">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 outline-none transition appearance-none cursor-pointer font-bold text-slate-900"
                  >
                    <option value={ROLES.CONSUMER}>Citizens / Consumer</option>
                    <option value={ROLES.FARMER}>Producer / Farmer</option>
                    <option value={ROLES.DISTRIBUTOR}>Logistics / Distributor</option>
                    <option value={ROLES.RETAILER}>Commercial / Retailer</option>
                  </select>
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <div className="w-2 h-2 border-b-2 border-r-2 border-slate-400 rotate-45"></div>
                  </div>
                </div>
              </div>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                <div>
                  <label htmlFor="confirmPassword" className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-2 ml-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 focus:bg-white outline-none transition-all duration-300 font-bold placeholder:text-slate-400 text-slate-900"
                    placeholder="••••••••"
                  />
                </div>
              </div>
  
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-200 hover:bg-emerald-700 hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </div>
            </form>
  
            <div className="mt-10 lg:text-left text-center">
              <p className="text-slate-600 font-bold uppercase tracking-widest text-[11px]">
                Already have an account?{' '}
                <Link to="/login" className="text-emerald-700 hover:text-emerald-800 transition-colors ml-1 font-black underline underline-offset-4 decoration-2">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
          
          <p className="hidden lg:block mt-12 text-slate-500 font-black uppercase tracking-[0.4em] text-[10px] opacity-40">
            AgriTrace Global Governance v2.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;

