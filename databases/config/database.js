require('dotenv').config();

module.exports = {
  development: {
    databaseUrl: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {require: true, rejectUnauthorized: false}
    },
    define: {
      timestamps: true,
      freezeTableName: true
    }
  },
  staging: {
    databaseUrl: process.env.DATABASE_URL,
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
    databaseUrl: process.env.DATABASE_URL,
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
    databaseUrl: process.env.DATABASE_URL,
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
