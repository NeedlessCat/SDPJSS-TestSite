import mongoose from "mongoose";

const connectDB = async () => {
  mongoose.connection.on("connected", () => console.log("Database Connected"));

  await mongoose.connect(`${process.env.MONGODB_URI}/sdpjss`, {
    ssl: true,
    tlsAllowInvalidCertificates: false,
    serverSelectionTimeoutMS: 5000,
  });
};

export default connectDB;
