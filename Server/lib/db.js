import mongoose from "mongoose";
//here we write the function to connect to the database
export const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("MongoDB connected successfully")
    );
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error("MONGODB_URI environment variable is not set");

    // Expect the full connection string (including database name) in MONGODB_URI.
    // Do not append additional slashes here because that may create an invalid namespace.
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Exit process on DB connection failure — prevents the server from running in a bad state
    process.exit(1);
  }
};
