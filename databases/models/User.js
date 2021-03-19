"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      user_id: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
      human_id: { type: DataTypes.STRING, allowNull: false, unique: true  },
      country_code: { type: DataTypes.STRING, allowNull: false },
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      real_name: { type: DataTypes.STRING, allowNull: true },
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
      last_active_at: { type: DataTypes.DATE, allowNull: false },
      profile_pic_path: { type: DataTypes.STRING, allowNull: false },
      profile_pic_asset_id: { type: DataTypes.STRING, allowNull: false },
      profile_pic_public_id: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.BOOLEAN, allowNull: false },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
    }
  );
  return User;
};
