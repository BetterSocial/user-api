const {Model} = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsToMany(models.Topics, {
        through: 'post_topics',
        foreignKey: 'post_id',
        otherKey: 'topic_id'
      });
    }
  }

  Post.init(
    {
      post_id: {type: DataTypes.UUID, primaryKey: true},
      author_user_id: {type: DataTypes.UUID, allowNull: false},
      anonymous: {type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false},
      parent_post_id: {type: DataTypes.UUID},
      audience_id: {type: DataTypes.STRING},
      duration: {type: DataTypes.DATE},
      visibility_location_id: {type: DataTypes.STRING},
      post_content: {type: DataTypes.STRING},
      createdAt: {type: DataTypes.DATE, field: 'created_at'},
      updatedAt: {type: DataTypes.DATE, field: 'updated_at'}
    },
    {
      sequelize,
      modelName: 'Post',
      tableName: 'posts',
      underscored: true
    }
  );

  return Post;
};
