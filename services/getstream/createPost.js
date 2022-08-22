const stream = require("getstream");
const { connectStreamChat } = require("./connectStreamChat");
const StreamChat = require('stream-chat').StreamChat;

module.exports = async (token, feedGroup, data, userId) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const clientChat = await connectStreamChat(userId, token);  
  const user = client.feed(feedGroup, client.userId, token);
  const userExc = client.feed('user_excl', client.userId, token)
  const defaultImage ='https://res.cloudinary.com/hpjivutj2/image/upload/v1636632905/vdg8solozeepgvzxyfbv.png'

  for(let i = 0; i < data.topics.length; i++) {
    const channel = await clientChat.channel('topics', `topic_${data.topics[i]}`, {name: `#${data.topics[i]}`, members: [userId], channel_type: 3, channel_image: defaultImage, channelImage: defaultImage, image: defaultImage})
    await channel.create()
    await channel.addMembers([userId])
    await channel.sendMessage({text: 'New topic post added'})
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
