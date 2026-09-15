const mongoose = require('mongoose');

// Connects to MongoDB using the URI from environment variables.
//
// In development we exit immediately on failure - fast, loud feedback
// while you're actively working. In production (e.g. Render/Railway)
// exiting the process turns a transient/misconfigured DB outage into a
// hard crash-restart loop, which looks like the whole app is down even
// though it's "just" the database - so instead we log the error and
// retry every 5s, and the process keeps serving (health checks, static
// assets, etc.) until Mongo comes back.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      console.error('Retrying MongoDB connection in 5s...');
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
