const traceabilityService = require('./traceabilityService');
const qrcode = require('qrcode');

const getTraceabilityReport = async (req, res) => {
  try {
    const { batchId } = req.params;

    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required for traceability report'
      });
    }

    const history = await traceabilityService.getProductHistory(batchId);

    res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    const statusCode = error.message === 'Product not found' ? 404 : 500;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const generateQRCode = async (req, res) => {
    try {
        const { batchId } = req.params;
        if (!batchId) {
            return res.status(400).json({ success: false, message: 'Batch ID is required' });
        }

        // Validate batch exists first
        await traceabilityService.getProductHistory(batchId);
        
        // Generate a trace URL (assuming frontend runs on a specific domain/port or dynamically via request)
        const traceUrl = `${req.protocol}://${req.get('host')}/api/consumer/traceability/${batchId}`;
        
        // Generate QR Code image data URI
        const qrCodeImage = await qrcode.toDataURL(traceUrl);

        res.status(200).json({
            success: true,
            data: {
                batchId,
                qrCodeUrl: traceUrl,
                qrCodeImage
            }
        });
    } catch (error) {
        const statusCode = error.message === 'Product not found' ? 404 : 500;
        res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
  getTraceabilityReport,
  generateQRCode
};