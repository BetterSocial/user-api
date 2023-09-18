const {redisClient: client} = require('../../config/redis');

client.on('connect', () => {
  console.log('redis connect');
});
client.on('error', (error) => {
  console.log('connection error ', error);
});
client.on('ready', () => {
  console.log('redis ready');
});
client.on('end', () => {
  console.log('redis disconnect');
});
process.on('SIGINT', () => {
  console.log('quit');
  client.quit();
});
process.on('uncaughtException', (err) => {
  console.error(err.stack);
  console.log('Node NOT Exiting...');
});

module.exports = client;
