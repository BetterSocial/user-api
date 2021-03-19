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

// require("dotenv").config();

// module.exports = {
//   development: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "postgres",
//     dialectOptions: {
//       ssl: { require: true, rejectUnauthorized: false },
//     },
//     define: {
//       timestamps: true,
//       freezeTableName: true,
//     },
//   },
//   test: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "postgres",
//     dialectOptions: {
//       ssl: { require: true, rejectUnauthorized: false },
//     },
//     define: {
//       timestamps: true,
//       freezeTableName: true,
//     },
//   },
//   production: {
//     username: process.env.DB_USERNAME,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: "postgres",
//     dialectOptions: {
//       ssl: { require: true, rejectUnauthorized: false },
//     },
//     define: {
//       timestamps: true,
//       freezeTableName: true,
//     },
//   },
// };
