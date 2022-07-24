'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserBlockedPostAnonymous extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserBlockedPostAnonymous.init(
    {
      blocked_action_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
      },
      user_id_blocker: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      post_anonymous_id_blocked: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      post_anonymous_author_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      reason_blocked: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: 'UserBlockedPostAnonymous',
      tableName: 'user_blocked_post_anonymous',
      timestamps: true,
      underscored: true,
    }
  );
  return UserBlockedPostAnonymous;
};
