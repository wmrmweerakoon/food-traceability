const consumerService = require('./consumerService');

const register = async (req, res) => {
  try {
    const { token, consumer } = await consumerService.registerConsumer(req.body);
    res.status(201).json({
      success: true,
      message: 'Consumer registered successfully',
      data: { token, consumer }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { token, consumer } = await consumerService.loginConsumer(email, password);
    res.status(200).json({
      success: true,
      message: 'Consumer logged in successfully',
      data: { token, consumer }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const consumer = await consumerService.getProfile(req.params.id);
    
    // Authorization check
    if (req.user.id !== consumer._id.toString() && req.user.role !== 'ROLE_ADMIN') {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    res.status(200).json({
      success: true,
      data: consumer
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const consumerId = req.params.id;

    // Authorization check
    if (req.user.id !== consumerId && req.user.role !== 'ROLE_ADMIN') {
        return res.status(403).json({ success: false, message: 'Unauthorized access' });
    }

    const updatedConsumer = await consumerService.updateProfile(consumerId, req.body);
    res.status(200).json({
      success: true,
      message: 'Consumer profile updated successfully',
      data: updatedConsumer
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
     const consumerId = req.params.id;

     // Authorization check
     if (req.user.id !== consumerId && req.user.role !== 'ROLE_ADMIN') {
         return res.status(403).json({ success: false, message: 'Unauthorized access' });
     }

    await consumerService.deleteAccount(consumerId);
    res.status(200).json({
      success: true,
      message: 'Consumer account deleted successfully'
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  deleteAccount
};
