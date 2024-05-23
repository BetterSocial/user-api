'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TopicInvitations extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(_models) {
      // define association here
    }
  }
  TopicInvitations.init(
    {
      topic_invitations_id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true
      },
      user_id_inviter: {type: DataTypes.STRING, allowNull: false},
      user_id_invited: {type: DataTypes.STRING, allowNull: false},
      topic_id: {type: DataTypes.BIGINT, allowNull: false},
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at',
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at',
        allowNull: false
      }
    },
    {
      sequelize,
      modelName: 'TopicInvitations',
      tableName: 'topic_invitations'
    }
  );
  return TopicInvitations;
};
