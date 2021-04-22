const stream = require("getstream");
exports.followTopic = async (token, userId) => {
  let id = userId.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", client.userId, token);
  return user.follow("topic", id);
};

exports.followTopics = async (token, userIds) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const follows = [];
  userIds.map((item) => {
    follows.push({
      source: "main_feed:" + client.userId,
      target: "topic:" + item.toLowerCase(),
    });
  });

  return await clientServer.followMany(follows);
};
