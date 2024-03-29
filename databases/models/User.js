const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      // models.User.hasMany(models.UserFollowUser);

      models.User.hasMany(models.UserFollowUser, {
        foreignKey: 'user_id_follower',
        as: 'following'
      });

      models.User.hasMany(models.UserFollowUser, {
        foreignKey: 'user_id_followed',
        as: 'follower'
      });
      models.User.hasMany(models.UserBlockedUser, {
        foreignKey: 'user_id_blocker',
        as: 'blocker'
      });
      models.User.hasMany(models.UserBlockedUser, {
        foreignKey: 'user_id_blocked',
        as: 'blocked'
      });

      models.User.belongsToMany(models.Topics, {
        through: 'user_topics',
        foreignKey: 'user_id',
        as: 'topics'
      });

      models.User.belongsToMany(models.Locations, {
        through: 'user_location',
        foreignKey: 'user_id',
        as: 'locations'
      });
      models.User.belongsToMany(models.UserLocation, {
        through: 'user_location',
        foreignKey: 'user_id',
        as: 'user_locations'
      });
    }
  }
  User.init(
    {
      user_id: {type: DataTypes.UUID, allowNull: false, primaryKey: true},
      human_id: {type: DataTypes.STRING, allowNull: false, unique: true},
      country_code: {type: DataTypes.STRING, allowNull: false},
      username: {type: DataTypes.STRING, allowNull: false, unique: true},
      real_name: {type: DataTypes.STRING, allowNull: true},
      last_active_at: {type: DataTypes.DATE, allowNull: false},
      profile_pic_path: {type: DataTypes.STRING, allowNull: true},
      profile_pic_asset_id: {type: DataTypes.STRING, allowNull: true},
      profile_pic_public_id: {type: DataTypes.STRING, allowNull: true},
      status: {type: DataTypes.BOOLEAN, allowNull: false},
      bio: {type: DataTypes.TEXT, allowNull: true},
      combined_user_score: {type: DataTypes.NUMBER, allowNull: true},
      karma_score: {type: DataTypes.NUMBER, allowNull: true},
      is_karma_unlocked: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
      is_banned: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_anonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      encrypted: {
        type: DataTypes.STRING,
        allowNull: true
      },
      allow_anon_dm: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      only_received_dm_from_user_following: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_backdoor_user: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      verified_status: {
        type: DataTypes.ENUM('VERIFIED', 'UNVERIFIED'),
        allowNull: false,
        defaultValue: 'VERIFIED'
      },
      updated_at: {
        type: 'TIMESTAMP',
        allowNull: false
      },
      created_at: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: '2023-01-01 00:00:00'
      }
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );
  return User;
};
