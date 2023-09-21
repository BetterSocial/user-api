'use strict';
const {Model} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserBlockedPostAnonymousHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserBlockedPostAnonymousHistory.init(
    {
      user_blocked_post_anonymous_history_id: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true
      },
      user_id_blocker: {type: DataTypes.UUID, allowNull: false},
      post_anonymous_id_blocked: {type: DataTypes.UUID, allowNull: false},
      action: DataTypes.STRING(5),
      source: DataTypes.STRING(50)
    },
    {
      sequelize,
      modelName: 'UserBlockedPostAnonymousHistory',
      tableName: 'user_blocked_post_anonymous_history',
      timestamps: false
    }
  );
  return UserBlockedPostAnonymousHistory;
};
