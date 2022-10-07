const stream = require("getstream");

module.exports = async (activityId, token, actorId) => {
  console.log('julak',actorId, )
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  return await client.reactions.add(
    "upvotes",
    { id: activityId },
    {
      count_upvote: 1,
     text: 'You have new upvote'
    }, {
       targetFeeds:  [`notification:${actorId}`] 
    }
  );
};
