require('dotenv').config();
const {MongoClient, ServerApiVersion} = require('mongodb');

const mongodbConfig = {
  local: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL
  },
  development: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL
  },
  staging: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL
  },
  test: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL
  },
  production: {
    database: process.env.MONGODB_DBNAME,
    url: process.env.MONGODB_URL
  }
};

const env = process.env.NODE_ENV || 'development';
console.debug(`env: ${env}`);
const config = mongodbConfig[env];
console.debug(`config: ${config.url}`);
const client = new MongoClient(config.url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
});
let db;

const getDb = async () => {
  if (db) {
    console.debug('mongodb already connected, just use it');
    return db;
  }
  console.debug('try to create mongodb connection');
  try {
    await client.connect();
    db = client.db(config.database);
    console.log('mongodb connected');
  } catch (e) {
    console.debug(`Error while connecting to mongodb: ${e}`);
  }

  return db;
};

module.exports = {
  getDb
};
