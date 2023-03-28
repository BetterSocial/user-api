const { sequelize, User,
  UserLocation,
  UserLocationHistory,
  UserTopic,
  UserTopicHistory,
  UserFollowUser,
  UserFollowUserHistory,
  Locations,
  UserFollowDomain,
  UserFollowDomainHistory,
  Topics, } = require("../../databases/models");

const { Op } = require("sequelize");
const { client } = require("../../services/redis/connectionRedis");
const ConnectGetstream = require("../../services/getstream/ConnectGetstream");

module.exports = async (req, res) => {
  try {

    const user_id = req.userId;

    let result = await sequelize.transaction(async (t) => {
      let user = await User.destroy({
        where: {
          user_id: user_id
        }
      })

      let topic = await UserTopic.destroy({
        where: {
          user_id: user_id
        }
      })

      let topicHistory = await UserTopicHistory.destroy({
        where: {
          user_id: user_id
        }
      })

      let userLocation = await UserLocation.destroy({
        where: {
          user_id
        }
      })


      let userLocationHistory = await UserLocationHistory.destroy({
        where: {
          user_id
        }
      })


      let userFollowDomain = await UserFollowDomain.destroy({
        where: {
          user_id_follower: user_id
        }
      })

      let userFollowDomainHistory = await UserFollowDomainHistory.destroy({
        where: {
          user_id_follower: user_id
        }
      })

      let userFollowUser = await UserFollowUser.destroy({
        where: {
          [Op.or]: [
            { 'user_id_follower': user_id },
            { 'user_id_followed': user_id }
          ]
        }
      })


      let userFollowUserHistory = await UserFollowUserHistory.destroy({
        where: {
          [Op.or]: [
            { 'user_id_follower': user_id },
            { 'user_id_followed': user_id }
          ]
        }
      })

      // var stream = require('getstream');
      // // Instantiate a new client (server side)
      // client = stream.connect('hqfuwk78kb3n', 'pgx8b6zy3dcwnbz43jw7t2e8pmhesjn24zwxesx8cbmphvhpnvbejakrxbwzb75x', '114344');
      // // Instantiate a new client (client side)
      // client = stream.connect('hqfuwk78kb3n', null, '114344');

      // instantiate a new client (server side) 

      const StreamChat = require("stream-chat").StreamChat;
      const serverClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
      const destroy = await serverClient.deleteUser(user_id, {
        mark_messages_deleted: true,
      });

      // return destroy;

      const stream = require('getstream');
      const clientFeed = stream.connect(process.env.API_KEY, process.env.SECRET);
      let status = await clientFeed.user(user_id).delete();
      return status;
    })

    res.json({
      status: 'success',
      // data: result
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: 'failed',
      message: error
    })
  }
}