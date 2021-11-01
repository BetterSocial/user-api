const stream = require("getstream");
const followTopic = async (token, userId) => {
  let id = userId.toLowerCase();
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", client.userId, token);
  return user.follow("topic", id);
};

const followTopics = async (token, userIds) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const follows = [];
  userIds.map((item) => {
    follows.push({
      source: "main_feed:" + client.userId,
      target: "topic:" + item.toLowerCase(),
    });
  });

  let res = await clientServer.followMany(follows);
  console.log("follow topic");
  console.log(res);
  return res;
};

module.exports = {
  followTopic,
  followTopics,
};
