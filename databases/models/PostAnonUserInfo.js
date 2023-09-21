'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostAnonUserInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PostAnonUserInfo.init(
    {
      post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true
      },
      anon_user_id: {type: DataTypes.STRING},
      anon_user_info_color_name: DataTypes.STRING,
      anon_user_info_color_code: DataTypes.STRING,
      anon_user_info_emoji_name: DataTypes.STRING,
      anon_user_info_emoji_code: DataTypes.STRING,
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      }
    },
    {
      sequelize,
      modelName: 'PostAnonUserInfo',
      tableName: 'post_anon_user_info',
      timestamps: true
    }
  );
  return PostAnonUserInfo;
};
