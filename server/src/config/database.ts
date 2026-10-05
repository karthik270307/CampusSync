import mongoose from "mongoose";

export const connectDatabase = async (): Promise<void> => {
  const rawUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/campussync";
  const mongoUri = rawUri.trim().replace(/^["']|["']$/g, "");

  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log(`MongoDB connected successfully to ${mongoUri.split("@").pop()?.split("?")[0]}`);
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    process.exit(1);
  }
};