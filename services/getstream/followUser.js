const stream = require("getstream");
const followUser = async (token, userId, feedGroup, status = 1) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed("main_feed", client.userId, token);
  if (status == 1) {
    return user.follow(feedGroup, userId);
  } else {
    return user.unfollow(feedGroup, userId);
  }
};

const followUserExclusive = async (userIdFollower, userIdFollowed, status = 1) => {
  // instantiate a new client (server side) 
  const client = stream.connect(process.env.API_KEY, process.env.SECRET);
  const user = client.feed("main_feed", userIdFollowed);
  if (status === 1) {
    return user.follow("user_excl", userIdFollower);
  } else {
    return user.unfollow("user_excl", userIdFollower);
  }
  // const user = client.feed("main_feed", userIdFollower);
  // if (status === 1) {
  //   return user.follow("user_excl", userIdFollowed);
  // } else {
  //   return user.unfollow("user_excl", userIdFollowed);
  // }
};

const followUsers = async (token, userIds) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  const follows = [];
  userIds.map((item) => {
    follows.push({
      source: "main_feed:" + client.userId,
      target: "user:" + item.toLowerCase(),
    });
  });

  let res = await clientServer.followMany(follows);
  console.log("follow Users");
  console.log(res);
  return res;
};

module.exports = {
  followUser,
  followUsers,
  followUserExclusive,
};
