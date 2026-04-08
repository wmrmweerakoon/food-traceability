import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { consumerAPI } from '../api/consumer';
import ProductJourney from '../components/ProductJourney';

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
          setError(response.message || 'No traceability data found for this batch.');
        }
      } catch (err) {
        console.error('Error loading traceability report:', err);
        setError(
          err.response?.data?.message ||
            'An error occurred while loading the traceability report.'
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading product journey...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 max-w-lg mx-4 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Unable to load product data</h1>
          <p className="text-gray-700 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            Please check that you scanned a valid code or try again later.
          </p>
        </div>
      </div>
    );
  }

  if (!report) {
    return null;
  }

  const { batchInfo, farmerInfo, summary } = report;

  const getStatusBadge = (status) => {
    const map = {
      expired: 'bg-red-100 text-red-800',
      available_at_retail: 'bg-green-100 text-green-800',
      sold_out: 'bg-yellow-100 text-yellow-800',
      in_transit: 'bg-blue-100 text-blue-800',
      delivered_to_retail: 'bg-purple-100 text-purple-800',
      with_producer: 'bg-gray-100 text-gray-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  // Adapt data for ProductJourney (simple mapping)
  const journeyData = {
    batch: {
      batchId: batchInfo.batchId,
      productName: batchInfo.productName,
      quantity: batchInfo.quantity,
      unit: batchInfo.unit,
      harvestDate: farmerInfo.harvestDate,
      expiryDate: farmerInfo.expiryDate,
      status: 'completed',
    },
    transport: report.transportHistory?.[0] || null,
    inventory: report.retailLocations?.[0] || null,
    consumer: null,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-green-600 uppercase tracking-wide">
                Food Traceability Report
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                {batchInfo.productName}
              </h1>
              <p className="mt-1 text-sm text-gray-500 font-mono">
                Batch ID: {batchInfo.batchId}
              </p>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                  summary.currentStatus
                )}`}
              >
                {summary.currentStatus.replace(/_/g, ' ')}
              </span>
              <div className="text-sm text-gray-600">
                <p>
                  Journey length:{' '}
                  <span className="font-semibold">
                    {summary.totalJourneyDays} days
                  </span>
                </p>
                <p>
                  Transport steps:{' '}
                  <span className="font-semibold">
                    {summary.totalTransportSteps}
                  </span>{' '}
                  · Retail locations:{' '}
                  <span className="font-semibold">
                    {summary.totalRetailLocations}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Key details grid */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500">Harvested on</p>
              <p className="mt-1 font-semibold text-gray-900">
                {farmerInfo.harvestDate
                  ? new Date(farmerInfo.harvestDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500">Best before</p>
              <p className="mt-1 font-semibold text-gray-900">
                {farmerInfo.expiryDate
                  ? new Date(farmerInfo.expiryDate).toLocaleDateString()
                  : 'N/A'}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500">Quantity</p>
              <p className="mt-1 font-semibold text-gray-900">
                {batchInfo.quantity} {batchInfo.unit}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-500">Quality / Organic</p>
              <p className="mt-1 font-semibold text-gray-900">
                {batchInfo.qualityGrade || 'Not specified'} ·{' '}
                {batchInfo.organicCertified ? 'Organic' : 'Conventional'}
              </p>
            </div>
          </div>

          {/* Farmer / origin */}
          <div className="mt-6 border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Grown by
              </h2>
              <p className="text-gray-800 font-medium">
                {farmerInfo.firstName} {farmerInfo.lastName}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {farmerInfo.address?.street && (
                  <>
                    {farmerInfo.address.street}
                    <br />
                  </>
                )}
                {[farmerInfo.address?.city, farmerInfo.address?.state]
                  .filter(Boolean)
                  .join(', ')}
                {farmerInfo.address?.country
                  ? ` · ${farmerInfo.address.country}`
                  : ''}
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Storage & handling
              </h2>
              <p className="text-sm text-gray-700">
                Temperature:{' '}
                <span className="font-medium">
                  {farmerInfo.storageConditions?.temperature || 'N/A'}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Humidity:{' '}
                <span className="font-medium">
                  {farmerInfo.storageConditions?.humidity || 'N/A'}
                </span>
              </p>
              <p className="text-sm text-gray-700">
                Other:{' '}
                <span className="font-medium">
                  {farmerInfo.storageConditions?.otherConditions || 'N/A'}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Detailed journey timeline */}
        <div className="mt-8">
          <ProductJourney traceabilityData={journeyData} />
        </div>
      </div>
    </div>
  );
}

export default TraceView;

