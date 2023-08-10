const {redisClient: client} = require('../../config/redis');

client.on('connect', () => {
  console.error('redis connect');
});
client.on('error', (error) => {
  console.error('connection error ', error);
});
client.on('ready', () => {
  console.error('redis ready');
});
client.on('end', () => {
  console.error('redis disconnect');
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
