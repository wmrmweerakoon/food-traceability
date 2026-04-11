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

const submitFeedback = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { rating, comment, consumerId } = req.body;

    const feedbackData = {
      rating,
      comment,
      consumerId // Optional depending on how auth is handled for feedback
    };

    const feedback = await traceabilityService.saveFeedback(batchId, feedbackData);

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully',
      data: feedback
    });
  } catch (error) {
    const statusCode = error.message === 'Product not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const getFeedback = async (req, res) => {
  try {
    const { batchId } = req.params;
    const feedbackData = await traceabilityService.getFeedbackByBatch(batchId);

    res.status(200).json({
      success: true,
      data: feedbackData
    });
  } catch (error) {
    const statusCode = error.message === 'Product not found' ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      message: error.message
    });
  }
};

const generateFeedbackQRCode = async (req, res) => {
    try {
        const { batchId } = req.params;
        if (!batchId) {
            return res.status(400).json({ success: false, message: 'Batch ID is required' });
        }

        // Validate batch exists first
        await traceabilityService.getProductHistory(batchId);
        
        // Use the 3rd party API (QR Server) to generate a QR Code link for feedback
        // The URL it points to would typically be a frontend page for submitting feedback
        const feedbackUrl = `${req.protocol}://${req.get('host')}/feedback/${batchId}`;
        
        // Construct the 3rd party API URL
        const qs = require('qs');
        const queryParams = qs.stringify({
           data: feedbackUrl,
           size: '250x250',
           format: 'png',
           margin: '10'
        });
        
        const thirdPartyQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?${queryParams}`;

        res.status(200).json({
            success: true,
            data: {
                batchId,
                feedbackUrl,
                qrCodeUrl: thirdPartyQrCodeUrl
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

const getDailyHealthTip = async (req, res) => {
    try {
        const result = await traceabilityService.getDailyHealthTip();
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
  getTraceabilityReport,
  generateQRCode,
  submitFeedback,
  getFeedback,
  generateFeedbackQRCode,
  getDailyHealthTip
};