import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { consumerAPI } from '../../api/consumer';
import ProductJourney from '../../components/ProductJourney';
import { Search, QrCode } from 'lucide-react';

function ConsumerDashboard() {
  const { user } = useAuth();
  const [batchId, setBatchId] = useState('');
  const [traceabilityData, setTraceabilityData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!batchId.trim()) {
      setError('Please enter a batch ID');
      return;
    }

    setLoading(true);
    setError('');
    setTraceabilityData(null);

    try {
      const response = await consumerAPI.getTraceabilityReport(batchId.trim());
      if (response.success) {
        setTraceabilityData(response.data);
      } else {
        setError(response.message || 'No traceability data found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching traceability data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Consumer Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.firstName}!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Track Product Journey
          </h2>
          <p className="text-gray-600 mb-4">
            Enter a batch ID or scan a QR code to view the complete journey of a product from farm to store.
          </p>
          
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1 relative">
              <QrCode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
                placeholder="Enter Batch ID (e.g., BATCH-1234567890-ABC123)"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Search className="w-5 h-5 mr-2" />
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Product Journey */}
        {traceabilityData && (
          <ProductJourney traceabilityData={traceabilityData} />
        )}

        {!traceabilityData && !loading && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Enter a batch ID above to view product traceability</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConsumerDashboard;

