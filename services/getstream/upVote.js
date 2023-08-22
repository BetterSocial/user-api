const stream = require('getstream');

module.exports = async (activityId, token, actorId) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return Promise.resolve(
    client.reactions.add(
      'upvotes',
      {id: activityId},
      {
        count_upvote: 1,
        text: ''
      },
      {
        targetFeeds: [`notification:${actorId}`]
      }
    )
  );
};
