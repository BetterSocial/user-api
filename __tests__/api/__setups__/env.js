require('dotenv').config({
  path: '.env.test'
});

Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_DBNAME: 'testing',
  DB_NAME: 'testing',
  SERVICE_ACCOUNT: 'e30=' // base64 of '{}'
});
