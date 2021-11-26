const Redis = require("ioredis");
/**
 * this is for local
 */
const client = new Redis({
  port: process.env.REDIS_PORT,
  host: process.env.REDIS_HOST,
  connectTimeout: 100,
});
/**
 * this is for production
 */
// const client = new Redis(String(process.env.REDIS_URL), {
//   tls: {
//     rejectUnauthorized: false,
//   },
// });
client.on("connect", function () {
  console.log(process.env.REDIS_URL);
  console.error("redis connect");
});
client.on("error", function (error) {
  console.error("connection error ", error);
});
client.on("ready", function () {
  console.error("redis ready");
});
client.on("end", function () {
  console.error("redis disconnect");
});
process.on("SIGINT", () => {
  console.log("quit");
  client.quit();
});
process.on("uncaughtException", function (err) {
  console.error(err.stack);
  console.log("Node NOT Exiting...");
});

module.exports = client;
