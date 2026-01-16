// src/lib/dbConnect.js
import mongoose from "mongoose";

let isConnected = false;

export async function dbConnect() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/UpSkillNow");
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
  }
}
