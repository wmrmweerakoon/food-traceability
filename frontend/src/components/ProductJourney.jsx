import { Package, Truck, Store, User, Calendar, MapPin } from 'lucide-react';

function ProductJourney({ traceabilityData }) {
  if (!traceabilityData) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
        No journey data available
      </div>
    );
  }

  const stages = [
    {
      id: 'harvest',
      title: 'Harvest',
      icon: Package,
      color: 'green',
      data: traceabilityData.batch,
      date: traceabilityData.batch?.harvestDate,
    },
    {
      id: 'transport',
      title: 'Transport',
      icon: Truck,
      color: 'blue',
      data: traceabilityData.transport,
      date: traceabilityData.transport?.departureTime,
    },
    {
      id: 'retail',
      title: 'Retail Store',
      icon: Store,
      color: 'purple',
      data: traceabilityData.inventory,
      date: traceabilityData.inventory?.receivedDate,
    },
    {
      id: 'consumer',
      title: 'Consumer',
      icon: User,
      color: 'orange',
      data: traceabilityData.consumer,
      date: traceabilityData.consumer?.purchaseDate,
    },
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      in_progress: 'bg-blue-100 text-blue-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Journey</h2>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="space-y-8">
          {stages.map((stage, index) => {
            const Icon = stage.icon;
            const isCompleted = stage.data && stage.date;
            const isActive = index === stages.findIndex(s => s.data && !s.data.status?.includes('completed'));

            return (
              <div key={stage.id} className="relative flex items-start">
                {/* Icon */}
                <div
                  className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full ${
                    isCompleted
                      ? stage.color === 'green'
                        ? 'bg-green-100 text-green-600'
                        : stage.color === 'blue'
                        ? 'bg-blue-100 text-blue-600'
                        : stage.color === 'purple'
                        ? 'bg-purple-100 text-purple-600'
                        : 'bg-orange-100 text-orange-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="ml-6 flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                      {stage.title}
                    </h3>
                    {stage.data?.status && (
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(stage.data.status)}`}>
                        {stage.data.status}
                      </span>
                    )}
                  </div>

                  {isCompleted && stage.data && (
                    <div className="mt-2 space-y-2">
                      {stage.id === 'harvest' && (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <Package className="w-4 h-4 mr-2" />
                            <span>Batch: {stage.data.batchId}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span>Product: {stage.data.productName}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span>Quantity: {stage.data.quantity} {stage.data.unit}</span>
                          </div>
                        </>
                      )}

                      {stage.id === 'transport' && (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <Truck className="w-4 h-4 mr-2" />
                            <span>Transport ID: {stage.data.transportId}</span>
                          </div>
                          {stage.data.origin && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>From: {stage.data.origin.locationName}</span>
                            </div>
                          )}
                          {stage.data.destination && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>To: {stage.data.destination.locationName}</span>
                            </div>
                          )}
                        </>
                      )}

                      {stage.id === 'retail' && (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <Store className="w-4 h-4 mr-2" />
                            <span>Store: {stage.data.storeName || 'N/A'}</span>
                          </div>
                          <div className="flex items-center text-sm text-gray-600">
                            <span>Stock: {stage.data.quantityInStock} {stage.data.unit}</span>
                          </div>
                        </>
                      )}

                      {stage.id === 'consumer' && (
                        <>
                          <div className="flex items-center text-sm text-gray-600">
                            <User className="w-4 h-4 mr-2" />
                            <span>Purchased by consumer</span>
                          </div>
                        </>
                      )}

                      {stage.date && (
                        <div className="flex items-center text-sm text-gray-500 mt-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>{new Date(stage.date).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {!isCompleted && (
                    <p className="mt-2 text-sm text-gray-400 italic">Pending...</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ProductJourney;

