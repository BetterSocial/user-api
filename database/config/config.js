const { DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_HOST } = process.env;
module.exports = {
  development: {
    username: String(DB_USERNAME),
    password: String(DB_PASSWORD),
    database: String(DB_DATABASE),
    host: String(DB_HOST),
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};
