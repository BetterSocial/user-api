const Redis = require("ioredis");
const client = new Redis({
  port: 6379,
  host: "localhost",
  connectTimeout: 10000,
});
client.on("connect", function () {
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
