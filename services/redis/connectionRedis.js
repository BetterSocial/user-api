const Redis = require('ioredis');
/**
 * this is for local
 */
/**
 * this is for production
 */
console.log(process.env.REDIS_URL);
const client = new Redis(String(process.env.REDIS_URL), {
  tls: {
    rejectUnauthorized: false,
    requestCert: true,
    agent: false
  }
});
client.on('connect', () => {
  console.error('redis connect');
});
client.on('error', () => {
  console.error('connection error ' /** error * */);
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
