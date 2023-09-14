require('dotenv').config();

Object.assign(process.env, {
  NODE_ENV: 'test',
  MONGODB_DBNAME: 'testing',
  DB_NAME: 'testing'
});
