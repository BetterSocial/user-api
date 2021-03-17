const { DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST } = process.env;
module.exports = {
  development: {
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
