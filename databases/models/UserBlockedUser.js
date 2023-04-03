"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserBlockedUser extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserBlockedUser.init(
    {
      blocked_action_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id_blocker: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      user_id_blocked: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reason_blocked: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      post_id: {
        type: DataTypes.UUID,
        allowNull:true
      },
      is_anonymous_user: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      sequelize,
      modelName: "UserBlockedUser",
      tableName: "user_blocked_user",
      timestamps: false,
    }
  );
  return UserBlockedUser;
};
