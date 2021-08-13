"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserFollowDomainHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserFollowDomainHistory.init(
    {
      follow_domain_history_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id_follower: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      domain_id_followed: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      action: DataTypes.STRING(5),
      source: DataTypes.STRING(50),
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
      modelName: "UserFollowDomainHistory",
      tableName: "user_follow_domain_history",
      timestamps: true,
    }
  );
  return UserFollowDomainHistory;
};
