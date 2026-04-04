import dotenv from "dotenv";

dotenv.config();

function getEnv(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

export const env = {
  PORT: Number(getEnv("PORT", "3001")),
  RIOT_API_KEY: getEnv("RIOT_API_KEY"),
  DATABASE_URL: getEnv("DATABASE_URL"),
  RIOT_REGION: getEnv("RIOT_REGION", "americas"),
  RIOT_PLATFORM: getEnv("RIOT_PLATFORM", "br1"),
};

if (!env.RIOT_API_KEY) {
  throw new Error("Missing RIOT_API_KEY in .env");
}

if (!env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL in .env");
}