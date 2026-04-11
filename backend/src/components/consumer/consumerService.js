const User = require('../../models/User');
const bcrypt = require('bcryptjs');

/**
 * Note: Registration and Login are primarily handled via the unified 
 * Auth Component. These service methods are preserved but redirected 
 * to the User model for backward compatibility and internal consistency.
 */

const getProfile = async (id) => {
  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

const updateProfile = async (id, updateData) => {
  // Prevent sensitive or role-based fields from being modified via this route
  const allowedUpdates = ['firstName', 'lastName', 'contactNumber', 'address'];
  const filteredUpdate = {};
  
  Object.keys(updateData).forEach(key => {
    if (allowedUpdates.includes(key)) {
      filteredUpdate[key] = updateData[key];
    }
  });

  const user = await User.findByIdAndUpdate(
    id,
    { $set: filteredUpdate },
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

const deleteAccount = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new Error('User not found');
  }
  return user;
};

// These methods are deprecated in favor of the global Auth service
// but are updated here to maintain service integrity if called
const registerConsumer = async (data) => {
    throw new Error('Please use the global Auth registration endpoint');
};

const loginConsumer = async (email, password) => {
    throw new Error('Please use the global Auth login endpoint');
};

module.exports = {
  getProfile,
  updateProfile,
  deleteAccount,
  registerConsumer,
  loginConsumer
};
