const stream = require("getstream");
module.exports = async (token, feedGroup, data, userId) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const user = client.feed(feedGroup, client.userId, token);
  const userExc = client.feed('user_excl', client.userId, token)
  const defaultImage ='https://res.cloudinary.com/hpjivutj2/image/upload/v1636632905/vdg8solozeepgvzxyfbv.png'
  for(let i = 0; i < data.topics.length; i++) {
    const channel = clientChat.channel('messaging', `${data.topics[i]}`, {name: `#${data.topics[i]}`, members: [userId], channel_type: 3, channel_image: defaultImage, channelImage: defaultImage, image: defaultImage, unread: 1})
    await channel.create()
  }
  
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
