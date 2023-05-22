const { sequelize, User,
  UserLocation,
  UserLocationHistory,
  UserTopic,
  UserTopicHistory,
  UserFollowUser,
  UserFollowUserHistory,
  UserFollowDomain,
  UserFollowDomainHistory,
  FcmToken,
 } = require("../../databases/models");

const { Op } = require("sequelize");

module.exports = async (req, res) => {
  try {

    const user_id = req.userId;

    await sequelize.transaction(async (t) => {
      await User.destroy({
        where: {
          user_id: user_id
        }
      })

      await UserTopic.destroy({
        where: {
          user_id: user_id
        }
      })

      await UserTopicHistory.destroy({
        where: {
          user_id: user_id
        }
      })

      await UserLocation.destroy({
        where: {
          user_id
        }
      })


      await UserLocationHistory.destroy({
        where: {
          user_id
        }
      })


      await UserFollowDomain.destroy({
        where: {
          user_id_follower: user_id
        }
      })

      await UserFollowDomainHistory.destroy({
        where: {
          user_id_follower: user_id
        }
      })

      await UserFollowUser.destroy({
        where: {
          [Op.or]: [
            { 'user_id_follower': user_id },
            { 'user_id_followed': user_id }
          ]
        }
      })


      await UserFollowUserHistory.destroy({
        where: {
          [Op.or]: [
            { 'user_id_follower': user_id },
            { 'user_id_followed': user_id }
          ]
        }
      })

      await FcmToken.destroy({
        where : { user_id }
      })

      await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_follower_count")
      await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_common_follower_count")
      await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_location_follower_count")
      await sequelize.query("REFRESH MATERIALIZED VIEW vwm_user_topic_follower_count_rank")

      const StreamChat = require("stream-chat").StreamChat;
      const serverClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
      await serverClient.deleteUser(user_id, {
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
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: 'failed',
      message: error
    })
  }
}