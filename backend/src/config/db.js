const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/food-traceability');

    console.log(`\n\x1b[32m🌱 ======================================== 🌱\x1b[0m`);
    console.log(`\x1b[1m\x1b[36m 🚀 DATABASE CONNECTED SUCCESSFULLY! 🚀\x1b[0m`);
    console.log(`\x1b[33m 🌐 Host:\x1b[0m ${conn.connection.host}`);
    console.log(`\x1b[33m 📦 Database:\x1b[0m ${conn.connection.name}`);
    console.log(`\x1b[32m🌱 ======================================== 🌱\x1b[0m\n`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;