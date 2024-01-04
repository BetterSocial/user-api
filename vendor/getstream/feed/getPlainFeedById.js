const GetstreamSingleton = require('../singleton');

module.exports = async (postId) => {
  if (!postId) throw new Error('Post id is required');

  const client = GetstreamSingleton.getInstance();
  const activity = await client.getActivities({
    ids: [postId],
    withOwnReactions: false,
    withOwnChildren: false,
    enrich: true,
    ownReactions: false,
    reactions: false,
    withReactionCounts: false,
    withRecentReactions: false
  });

  if (!activity.results.length) return Promise.reject(new Error('Post not found'));
  return Promise.resolve(activity.results[0]);
};
