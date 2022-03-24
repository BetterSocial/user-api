const stream = require("getstream");
module.exports = async (token, feedGroup, data) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed(feedGroup, client.userId, token);
  const userExc = client.feed('user_excl', client.userId, token)

  // let userExcData = {...data}
  // userExcData.to = []
  // userExcData.object.feed_group = "user_excl"

  // data.foreign_id = client.userId + new Date().getTime();
  // data.actor = client.user(client.userId).ref();

  // userExcData.foreign_id = client.userId + new Date().getTime();
  // userExcData.actor = client.user(client.userId).ref();
  // await userExc.addActivity(userExcData)
  // return user.addActivity(data);

  return userExc.addActivity(data)
};
