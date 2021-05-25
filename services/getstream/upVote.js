const stream = require("getstream");

module.exports = async (activityId, token) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );

  // const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  // return await clientServer.reactions.add(
  //   "upvotes",
  //   { id: activityId },
  //   {
  //     count_upvote: 1,
  //   }
  // );
  return await clientUser.reactions.add(
    "upvotes",
    { id: activityId },
    {
      count_upvote: 1,
    }
  );
};
