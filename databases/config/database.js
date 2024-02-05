require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {require: true, rejectUnauthorized: false}
    },
    define: {
      timestamps: true,
      freezeTableName: true
    },
    logging: false
  },
  staging: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {require: true, rejectUnauthorized: false}
    },
    define: {
      timestamps: true,
      freezeTableName: true
    }
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ...(process.env.DB_SSL !== 'false'
        ? {
            ssl: {require: true, rejectUnauthorized: false}
          }
        : {})
    },
    logging: false,
    define: {
      timestamps: true,
      freezeTableName: true
    }
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {require: true, rejectUnauthorized: false}
    },
    define: {
      timestamps: true,
      freezeTableName: true
    }
  }
};
