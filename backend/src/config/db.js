import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb() {
  if (!env.mongoUri) {
    console.warn("MONGO_URI not set, running in demo mode without database.");
    return;
  }
  await mongoose.connect(env.mongoUri);
  console.log("MongoDB connected.");
}
