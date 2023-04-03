"use strict";
const { Model, DataTypes } = require("sequelize");
module.exports = (sequelize, type) => {
  class LogError extends Model {}

  LogError.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      message: DataTypes.TEXT,
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: "updated_at",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "LogError",
      tableName: "log_errors",
      underscored: true,
    }
  );

  return LogError;
};
