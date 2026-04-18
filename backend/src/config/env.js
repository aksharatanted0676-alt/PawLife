import dotenv from "dotenv";

dotenv.config();

function requireEnv(name) {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Create backend/.env (see backend/.env.example) and set ${name}.`
    );
  }
  return value;
}

export const env = Object.freeze({
  // Server
  port: Number(process.env.PORT || 8080),
  mongoUri: process.env.MONGO_URI || "",
  clientOrigin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
  nodeEnv: process.env.NODE_ENV || "development",

  // Auth
  jwtSecret: requireEnv("JWT_SECRET"),

  // External API credentials (keep server-only)
  apiKey: requireEnv("API_KEY"),
  apiSecret: requireEnv("API_SECRET"),

  // Optional (app runs in demo mode without it)
  geminiApiKey: process.env.GEMINI_API_KEY || ""
});

export function getApiCredentials() {
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("Missing API credentials");
  }
  return { apiKey, apiSecret };
}
