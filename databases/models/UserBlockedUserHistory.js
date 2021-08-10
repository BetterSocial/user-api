"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserBlockedUserHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserBlockedUserHistory.init(
    {
      user_blocked_user_history_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id_blocker: { type: DataTypes.UUID, allowNull: false },
      user_id_blocked: { type: DataTypes.UUID, allowNull: false },
      action: DataTypes.STRING(5),
      source: DataTypes.STRING(50),
    },
    {
      sequelize,
      modelName: "UserBlockedUserHistory",
      tableName: "user_blocked_user_history",
      timestamps: false,
    }
  );
  return UserBlockedUserHistory;
};
