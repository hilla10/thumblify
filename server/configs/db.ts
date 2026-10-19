import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    mongoose.connection.on('connected', () =>
      console.log('MongodDB connected'),
    );
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('You successfully connected to MongoDB!');
    return mongoose;
  } catch (error) {
    console.dir('Error connecting to MongoDB:', error);
  }
};

export default connectDB;
