// const Sequelize = require("sequelize");
// const sequelize = new Sequelize(
//   "postgres://grwqkvtkbimzfk:a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e@ec2-54-90-13-87.compute-1.amazonaws.com:5432/d14fitnnuq2nco"
// );
const client = require("../../../config/config");
module.exports = async (req, res) => {
  try {
    // sequelize

    //   .authenticate()

    //   .then(() => {
    //     console.log("Connection has been established successfully.");
    //   })

    //   .catch((err) => {
    //     console.error("Unable to connect to the database:", err);
    //   });

    try {
      client.query(
        "SELECT table_schema,table_name FROM information_schema.tables;",
        (err, res) => {
          if (err) throw err;
          for (let row of res.rows) {
            console.log(JSON.stringify(row));
          }
          client.end();
        }
      );
    } catch (error) {
      console.log(error);
    }

    return res.json("helo");
  } catch (error) {
    return res.status(404).json(error);
  }
};

// DB_HOST=ec2-54-90-13-87.compute-1.amazonaws.com
// DB_USERNAME=grwqkvtkbimzfk
// DB_PASSWORD=a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e
// DB_NAME=d14fitnnuq2nco
// DB_PORT=5432
// DATABASE_URL=postgres://grwqkvtkbimzfk:a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e@ec2-54-90-13-87.compute-1.amazonaws.com:5432/d14fitnnuq2nco

// DATABASE_URL=dbname=d14fitnnuq2nco host=ec2-54-90-13-87.compute-1.amazonaws.com port=5432 user=grwqkvtkbimzfk password=a50ea327c9824a4f386778c8b553648649f597d46e3db29b67ea21849f9a169e sslmode=require
