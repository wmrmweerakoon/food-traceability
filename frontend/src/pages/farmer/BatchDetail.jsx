import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { farmerAPI } from '../../api/farmer';
import { QrCode } from 'lucide-react';

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

  const handleUpdateBatch = () => {
    navigate(`/farmer/batches/${id}/edit`);
  };

  if (loading) {
    return <div className="p-8">Loading batch details...</div>;
  }

  if (!batch) {
    return <div className="p-8">Batch not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Batch Details</h1>
              <p className="text-gray-600">{batch.batchId}</p>
            </div>
            <button
              onClick={() => navigate('/farmer/dashboard')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Product Name</label>
                  <p className="mt-1 text-gray-900">{batch.productName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Harvest Date</label>
                    <p className="mt-1 text-gray-900">{new Date(batch.harvestDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <p className="mt-1 text-gray-900">{new Date(batch.expiryDate).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <p className="mt-1 text-gray-900">{batch.quantity} {batch.unit}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quality Grade</label>
                    <p className="mt-1 text-gray-900">{batch.qualityGrade || 'Not specified'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Organic Certified</label>
                  <p className="mt-1 text-gray-900">{batch.organicCertified ? 'Yes' : 'No'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Pesticide Residue</label>
                  <p className="mt-1 text-gray-900">{batch.pesticideResidue || 'None'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    batch.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {batch.status}
                  </span>
                </div>

                {batch.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-gray-900">{batch.notes}</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Storage Conditions</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Temperature</label>
                  <p className="mt-1 text-gray-900">{batch.storageConditions?.temperature || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Humidity</label>
                  <p className="mt-1 text-gray-900">{batch.storageConditions?.humidity || 'Not specified'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Other Conditions</label>
                  <p className="mt-1 text-gray-900">{batch.storageConditions?.otherConditions || 'Not specified'}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h2>
                
                <button
                  onClick={handleGenerateQRCode}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition mb-4"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Generate QR Code
                </button>

                {showQR && qrCode && (
                  <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
                    <img src={qrCode} alt="Batch QR Code" className="max-w-xs max-h-xs" />
                    <p className="text-sm text-gray-600 mt-2">Scan this QR code to trace the product journey</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-4 mt-8 pt-6 border-t">
            <button
              onClick={handleUpdateBatch}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Edit Batch
            </button>
            <button
              onClick={async () => {
                if (window.confirm('Are you sure you want to delete this batch?')) {
                  try {
                    await farmerAPI.deleteBatch(id);
                    alert('Batch deleted successfully');
                    navigate('/farmer/dashboard');
                  } catch (error) {
                    console.error('Error deleting batch:', error);
                    alert('Failed to delete batch');
                  }
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Batch
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BatchDetail;