const GetstreamSingleton = require('../singleton');

module.exports = async (activity_id, kind = 'comment', limit = 20) => {
  if (!activity_id) throw new Error('Reaction ID is required');
  // if(!activityId) throw new Error("Activity ID is required");

  const client = GetstreamSingleton.getInstance();
  const reaction = await client.reactions.filter({
    activity_id,
    kind,
    limit
  });

  if (!reaction) Promise.reject(new Error('Reaction not found'));
  return Promise.resolve(reaction);
};
