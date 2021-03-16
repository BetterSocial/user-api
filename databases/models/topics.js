"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class topics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  topics.init(
    {
      topic_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      icon_path: DataTypes.STRING,
      categories: DataTypes.TEXT,
      created_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "topics",
      timestamps: false,
    }
  );
  return topics;
};
