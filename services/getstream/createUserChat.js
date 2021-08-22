const StreamChat = require('stream-chat').StreamChat;
const chatClient = StreamChat.getInstance(process.env.API_KEY, {
  timeout: 6000,
});
module.exports = async (data, token, userId) => {
  data.id = userId;
  // await chatClient.connectUser(
  //   // {
  //   //   id: 'john',
  //   //   name: 'John Doe',
  //   //   image: 'https://getstream.io/random_svg/?name=John',
  //   // }
  //   data,
  //   token
  // );
};
