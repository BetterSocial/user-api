"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserBlockedDomain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserBlockedDomain.init(
    {
      user_blocked_domain_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id_blocker: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      domain_page_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reason_blocked: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "UserBlockedDomain",
      tableName: "user_blocked_domain",
      timestamps: true,
      underscored: true,
    }
  );
  return UserBlockedDomain;
};
