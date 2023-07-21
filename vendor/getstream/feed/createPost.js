const GetstreamSingleton = require('../singleton');

const createPost = async (token, data) => {
  const client = GetstreamSingleton.getClientInstance(token);
  const userExclusiveFeed = client.feed('user_excl', client.userId, token);
  return userExclusiveFeed.addActivity(data);
};

module.exports = createPost;
