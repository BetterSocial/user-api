"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserFollowDomain extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserFollowDomain.init(
    {
      follow_action_id: {
        type: DataTypes.STRING,
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
      modelName: "UserFollowDomain",
      tableName: "user_follow_domain",
      timestamps: true,
    }
  );
  return UserFollowDomain;
};
