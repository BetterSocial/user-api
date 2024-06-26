const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Topics extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Topics.belongsToMany(models.User, {
        through: 'user_topics',
        foreignKey: 'topic_id',
        as: 'users'
      });
      Topics.belongsToMany(models.Post, {
        through: 'post_topics',
        foreignKey: 'topic_id',
        otherKey: 'post_id'
      });
    }
  }
  Topics.init(
    {
      topic_id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true
      },
      name: DataTypes.STRING,
      icon_path: DataTypes.STRING,
      cover_path: DataTypes.STRING,
      categories: DataTypes.TEXT,
      created_at: DataTypes.DATE,
      deleted_at: DataTypes.DATE,
      is_custom_topic: DataTypes.BOOLEAN,
      sort: DataTypes.BIGINT,
      sign: DataTypes.BOOLEAN
    },
    {
      sequelize,
      modelName: 'Topics',
      tableName: 'topics',
      timestamps: false,
      underscored: true
    }
  );
  return Topics;
};
