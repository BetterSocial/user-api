const Redis = require("ioredis");
module.exports = async (key) => {
  try {
    const client = new Redis(process.env.REDIS_URL, {
      tls: {
        rejectUnauthorized: false,
      },
    });
    return client.get(key, function (err, result) {
      if (err) {
        console.error(err);
        return null;
      } else {
        return result;
      }
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};
