import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consumerAPI } from '../../api/consumer';
import { User, Mail, Phone, ShieldCheck, CheckCircle } from 'lucide-react';

function ConsumerProfile() {
  const { user, login } = useAuth(); // Can re-trigger context update if needed
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
        // Update user context manually if needed or let the next refresh handle it
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading Profile...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-['Outfit',sans-serif]">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">My Profile</h1>
              <p className="text-slate-500">Manage your Consumer Account Details</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Read-Only Identity (Username/Email) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex items-center text-slate-600">
            <ShieldCheck className="w-5 h-5 text-indigo-500 mr-2" />
            <span className="text-sm font-medium">Username:</span>
            <span className="ml-2 bg-slate-100 px-3 py-1 rounded-md text-sm">{user?.username}</span>
          </div>
          <div className="flex items-center text-slate-600">
            <Mail className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium">Email:</span>
            <span className="ml-2 bg-slate-100 px-3 py-1 rounded-md text-sm">{user?.email}</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {message && (
              <div className={`p-4 rounded-xl ${message.includes('success') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                <div className="flex items-center">
                  {message.includes('success') && <CheckCircle className="w-5 h-5 mr-2 text-emerald-600" />}
                  {message}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                    className="pl-10 w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Last Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                    className="pl-10 w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Contact Number</label>
                <div className="relative max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    value={formData.contactNumber}
                    onChange={(e) => setFormData({...formData, contactNumber: e.target.value})}
                    className="pl-10 w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 transition"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition shadow-lg shadow-emerald-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving Changes...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ConsumerProfile;
