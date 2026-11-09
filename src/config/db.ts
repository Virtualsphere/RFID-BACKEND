import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Explicit timeouts and a warm pool. With Mongoose's defaults, a request
    // arriving while the connection is unhealthy waits on a 30s server
    // selection before failing — that queueing is a likely contributor to the
    // 20-30s responses seen on /api/products.
    const conn = await mongoose.connect(process.env.MONGO_URI as string, {
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      maxPoolSize: 20,
      minPoolSize: 2,
      maxIdleTimeMS: 60000,
    });
    console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
