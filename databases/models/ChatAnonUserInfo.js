'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatAnonUserInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ChatAnonUserInfo.init(
    {
      chat_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4,
      },
      channelId: DataTypes.STRING,
      targetUserId: DataTypes.STRING,
      myAnonUserId: DataTypes.STRING,
      anon_user_info_color_name: DataTypes.STRING,
      anon_user_info_color_code: DataTypes.STRING,
      anon_user_info_emoji_name: DataTypes.STRING,
      anon_user_info_emoji_code: DataTypes.STRING,
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      modelName: 'ChatAnonUserInfo',
      tableName: 'chatAnonUserInfo',
      timestamps: true,
    }
  );
  return ChatAnonUserInfo;
};
