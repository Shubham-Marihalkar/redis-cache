const Redis = require("ioredis");

function connectToRedis(redisProps) {
  const redisDefaultProps = {
    host: "127.0.0.1",
    port: "6379",
    db: 1,
    maxRetriesPerRequest: 20,
    retryStrategy(times) {
      console.warn(`Retrying redis connection: attempt ${times}`);
      return Math.min(times * 500, 2000);
    },
  };

  const g_redis = new Redis({ ...redisDefaultProps, ...redisProps });

  g_redis.on("connecting", () => {
    console.log("Connecting to Redis.");
  });
  g_redis.on("connect", () => {
    console.log("Success! Redis connection established.");
  });
  g_redis.on("error", (err) => {
    if (err.code === "ECONNREFUSED") {
      console.warn(`Could not connect to Redis: ${err.message}.`);
    } else if (err.name === "MaxRetriesPerRequestError") {
      console.error(`Critical Redis error: ${err.message}. Shutting down.`);
      process.exit(1);
    } else {
      console.error(`Redis encountered an error: ${err.message}.`);
    }
  });
}

connectToRedis();