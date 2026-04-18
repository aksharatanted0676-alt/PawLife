import mongoose from "mongoose";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongo = globalThis as typeof globalThis & {
  __pawlifeMongoose?: MongooseCache;
};

const cache: MongooseCache = globalForMongo.__pawlifeMongoose ?? { conn: null, promise: null };

if (process.env.NODE_ENV !== "production") {
  globalForMongo.__pawlifeMongoose = cache;
}

export async function connectMongo(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) return null;

  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, { bufferCommands: false }).then((m) => m);
  }

  try {
    cache.conn = await cache.promise;
    return cache.conn;
  } catch (err) {
    cache.promise = null;
    console.error("MongoDB connection error:", err);
    return null;
  }
}
