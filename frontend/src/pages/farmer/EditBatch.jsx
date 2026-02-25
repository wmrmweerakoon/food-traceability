import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { farmerAPI } from '../../api/farmer';

function EditBatch() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBatch = async () => {
      try {
        const response = await farmerAPI.getBatchById(id);
        if (response.success && response.data) {
          const batch = response.data;
          setFormData({
            productName: batch.productName || '',
            harvestDate: batch.harvestDate
              ? new Date(batch.harvestDate).toISOString().slice(0, 10)
              : '',
            expiryDate: batch.expiryDate
              ? new Date(batch.expiryDate).toISOString().slice(0, 10)
              : '',
            quantity: batch.quantity ?? '',
            unit: batch.unit || 'kg',
            qualityGrade: batch.qualityGrade || '',
            organicCertified: !!batch.organicCertified,
            pesticideResidue: batch.pesticideResidue || 'None',
            storageConditions: {
              temperature: batch.storageConditions?.temperature || '',
              humidity: batch.storageConditions?.humidity || '',
              otherConditions: batch.storageConditions?.otherConditions || '',
            },
            notes: batch.notes || '',
          });
        } else {
          setError(response.message || 'Failed to load batch');
        }
      } catch (err) {
        console.error('Error loading batch for edit:', err);
        setError(
          err.response?.data?.message ||
            'An error occurred while loading the batch.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadBatch();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setError('');

    if (name.startsWith('storageConditions.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        storageConditions: {
          ...prev.storageConditions,
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;

    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        quantity: parseFloat(formData.quantity),
      };

      const response = await farmerAPI.updateBatch(id, payload);

      if (response.success) {
        alert('Batch updated successfully!');
        navigate(`/farmer/batches/${id}`);
      } else {
        setError(response.message || 'Failed to update batch');
      }
    } catch (err) {
      console.error('Error updating batch:', err);
      setError(
        err.response?.data?.message ||
          'An error occurred while updating the batch'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !formData) {
    return <div className="p-8">Loading batch for editing...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Product Batch</h1>
              <p className="text-gray-600">
                Update details for batch <span className="font-mono">{id}</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/farmer/batches/${id}`)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Back to Details
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter product name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Harvest Date *
                </label>
                <input
                  type="date"
                  name="harvestDate"
                  value={formData.harvestDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Enter quantity"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="kg">kg</option>
                    <option value="lbs">lbs</option>
                    <option value="pieces">pieces</option>
                    <option value="liters">liters</option>
                    <option value="gallons">gallons</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality Grade
                </label>
                <select
                  name="qualityGrade"
                  value={formData.qualityGrade}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select grade</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="Premium">Premium</option>
                  <option value="Standard">Standard</option>
                  <option value="Substandard">Substandard</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pesticide Residue
                </label>
                <select
                  name="pesticideResidue"
                  value={formData.pesticideResidue}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="None">None</option>
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="organicCertified"
                  checked={formData.organicCertified}
                  onChange={handleChange}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Organic Certified
                </label>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Storage Conditions</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Temperature
                  </label>
                  <input
                    type="text"
                    name="storageConditions.temperature"
                    value={formData.storageConditions.temperature}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 4°C"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Humidity
                  </label>
                  <input
                    type="text"
                    name="storageConditions.humidity"
                    value={formData.storageConditions.humidity}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="e.g., 60%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Conditions
                  </label>
                  <input
                    type="text"
                    name="storageConditions.otherConditions"
                    value={formData.storageConditions.otherConditions}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Additional conditions"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Additional notes about the batch..."
              />
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/farmer/batches/${id}`)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditBatch;

