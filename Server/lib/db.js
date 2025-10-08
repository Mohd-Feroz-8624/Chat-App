import mongoose from "mongoose";
//here we write the function to connect to the database
export const connectDB = async () => {
  try {
    mongoose.connection.on('connected',()=> console.log("MongoDB connected successfully"));
    await mongoose.connect(`${process.env.MONGODB_URI}/chatApp`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};
