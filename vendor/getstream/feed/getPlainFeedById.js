const GetstreamSingleton = require('../singleton');

module.exports = async (postId, options = {}) => {
  if (!postId) throw new Error('Post id is required');
  let defaultOptions = {
    withOwnReactions: options.withOwnReactions || false,
    withOwnChildren: options.withOwnChildren || false,
    enrich: options.enrich || true,
    ownReactions: options.ownReactions || false,
    reactions: options.reactions || false,
    withReactionCounts: options.withReactionCounts || false,
    withRecentReactions: options.withRecentReactions || false
  };

  const client = GetstreamSingleton.getInstance();
  const activity = await client.getActivities({
    ids: [postId],
    ...defaultOptions
  });

  if (!activity.results.length) return Promise.reject(new Error('Post not found'));
  return Promise.resolve(activity.results[0]);
};
