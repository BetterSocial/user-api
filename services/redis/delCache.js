const Redis = require("ioredis");
module.exports = async (key) => {
  try {
    const client = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    });
    await client.del(key);
  } catch (error) {
    console.log(error);
    throw new Error("Error get data");
  }
};
