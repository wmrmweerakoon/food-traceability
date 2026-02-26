const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Consumer = require('../../models/Consumer');

const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

const registerConsumer = async (data) => {
  const { name, email, password } = data;
  
  if (!name || !email || !password) {
    throw new Error('Please provide all required fields');
  }

  const existing = await Consumer.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw new Error('Consumer with this email already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const consumer = new Consumer({
    name,
    email,
    password: hashedPassword,
    role: 'ROLE_CONSUMER'
  });

  await consumer.save();
  
  const token = generateToken(consumer._id, consumer.role);
  const consumerData = consumer.toObject();
  delete consumerData.password;

  return { token, consumer: consumerData };
};

const loginConsumer = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  const consumer = await Consumer.findOne({ email: email.toLowerCase() });
  if (!consumer) {
    throw new Error('Invalid email or password');
  }

  const isMatch = await bcrypt.compare(password, consumer.password);
  if (!isMatch) {
    throw new Error('Invalid email or password');
  }

  const token = generateToken(consumer._id, consumer.role);

  const consumerData = consumer.toObject();
  delete consumerData.password;

  return { token, consumer: consumerData };
};

const getProfile = async (id) => {
  const consumer = await Consumer.findById(id).select('-password');
  if (!consumer) {
    throw new Error('Consumer not found');
  }
  return consumer;
};

const updateProfile = async (id, updateData) => {
  if (updateData.password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(updateData.password, salt);
  }

  delete updateData.role; // Prevent changing role

  const consumer = await Consumer.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).select('-password');

  if (!consumer) {
    throw new Error('Consumer not found');
  }

  return consumer;
};

const deleteAccount = async (id) => {
  const consumer = await Consumer.findByIdAndDelete(id);
  if (!consumer) {
    throw new Error('Consumer not found');
  }
  return consumer;
};

module.exports = {
  registerConsumer,
  loginConsumer,
  getProfile,
  updateProfile,
  deleteAccount
};
