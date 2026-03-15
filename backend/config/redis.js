const Redis = require("ioredis");

let redis;

if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy: (times) => {
      if (times > 3) return null; // ✅ 3 baar try karo, phir skip
      return Math.min(times * 200, 1000);
    },
  });
} else {
  // Local Redis fallback
  redis = new Redis({
    host: "127.0.0.1",
    port: 6379,
    maxRetriesPerRequest: 3,
  });
}

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) =>
  console.warn("⚠️ Redis error (non-critical):", err.message),
);

module.exports = redis;
