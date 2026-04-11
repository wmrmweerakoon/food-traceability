import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { consumerAPI } from '../../api/consumer';
import { User, Mail, Phone, ShieldCheck, CheckCircle } from 'lucide-react';

function ConsumerProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
  });

  useEffect(() => {
    if (user && user._id) {
      loadProfile(user._id);
    }
  }, [user]);

  const loadProfile = async (id) => {
    try {
      const response = await consumerAPI.getProfile(id);
      if (response.success) {
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          contactNumber: response.data.contactNumber || '',
        });
      }
    } catch (error) {
      setMessage('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await consumerAPI.updateProfile(user._id, formData);
      if (response.success) {
        setMessage('Profile updated successfully!');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you absolutely sure you want to delete your AgriTrace account? This action is IRREVERSIBLE and all your data will be permanently removed.')) {
      try {
        const response = await consumerAPI.deleteAccount(user._id);
        if (response.success) {
          logout();
          navigate('/');
        }
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete account. Please try again.');
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">My Profile</h1>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-1">Manage your Consumer Account Details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Read-Only Identity (Username/Email) */}
        <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex items-center text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-500 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username:</span>
            <span className="ml-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg text-sm font-black text-slate-900">{user?.username}</span>
          </div>
          <div className="flex items-center text-slate-600">
            <Mail className="w-5 h-5 text-indigo-500 mr-2" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Email:</span>
            <span className="ml-2 bg-slate-50 border border-slate-100 px-3 py-1 rounded-lg text-sm font-black text-slate-900">{user?.email}</span>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Personal Information</h2>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Verified Identity Record</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {message && (
              <div className={`p-4 rounded-2xl ${message.includes('success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                <div className="flex items-center font-bold text-sm">
                  {message.includes('success') && <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />}
                  {message}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="pl-12 w-full rounded-2xl border border-slate-200 p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 bg-slate-50 transition font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="pl-12 w-full rounded-2xl border border-slate-200 p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 bg-slate-50 transition font-bold text-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest ml-1">Contact Number</label>
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="pl-12 w-full rounded-2xl border border-slate-200 p-4 focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 bg-slate-50 transition font-bold text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="pt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition shadow-xl shadow-emerald-200 hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>

        {/* ⚠️ Danger Zone */}
        <div className="mt-12 bg-white rounded-[2.5rem] border border-rose-100 overflow-hidden">
          <div className="p-8 border-b border-rose-50 bg-rose-50/30">
            <h2 className="text-xl font-black text-rose-900 tracking-tight">Danger Zone</h2>
            <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">Irreversible Account Actions</p>
          </div>
          <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-slate-900 font-bold mb-1">Delete your AgriTrace account</h3>
              <p className="text-sm text-slate-500 font-medium">
                Once you delete your account, all your verified data and interactions will be permanently removed. This action cannot be undone.
              </p>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="bg-white border-2 border-rose-200 text-rose-600 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all duration-300"
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConsumerProfile;
