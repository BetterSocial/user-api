const {StreamChat} = require('stream-chat');
const {CHANNEL_TYPE_STRING} = require('../../helpers/constants');
const {Topics, User, FcmToken} = require('../../databases/models');
const {messaging} = require('firebase-admin');

module.exports = async (req, res) => {
  try {
    let response;
    let {member_ids, topic_id} = req.body;

    let inviter = await User.findOne({
      where: {
        user_id: req?.userId
      }
    });

    if (!inviter) {
      response = {
        success: false,
        message: `Inviter user id : ${inviter} not found`
      };

      return res.status(400).json(response);
    }

    let topics = await Topics.findOne({
      where: {
        topic_id,
        deleted_at: null
      }
    });

    if (!topics) {
      response = {
        success: false,
        message: 'Community id not found'
      };

      return res.status(400).json(response);
    }

    await Promise.all(
      member_ids.map(async (user_id) => {
        let user = await User.findOne({
          where: {
            user_id
          }
        });

        if (!user) {
          response = {
            success: false,
            message: `User id : ${user_id} not found`
          };

          return res.status(400).json(response);
        }

        const invitations_msg = `${inviter.username} invited you to join ${topics.name} community`;

        //topic invitation message primary chat
        const client = new StreamChat(process.env.API_KEY, process.env.SECRET);

        const channel = await client.channel(
          CHANNEL_TYPE_STRING.TOPIC_INVITATION,
          `${user.username}_${topics.name}`,
          {
            name: `#${topics.name}`,
            created_by_id: req?.userId,
            members: [user_id],
            channel_type: 5,
            channel_image: topics.icon_path,
            channelImage: topics.icon_path,
            image: topics.icon_path
          }
        );
        await channel.create();
        await channel.sendMessage({user_id: req?.userId, text: invitations_msg}, {skip_push: true});
        //end topic invitation message primary chat

        let userToken = await FcmToken.findOne({
          where: {
            user_id
          }
        });

        const payload = {
          notification: {
            title: invitations_msg,
            image: user.profile_pic_path
          },
          data: {
            topic_id,
            type: 'topic'
          }
        };
        if (userToken) {
          messaging()
            .sendToDevice(userToken.token, payload)
            .then(() => {});
        }

        return user_id;
      })
    );

    response = {
      success: true,
      message: 'Invited members'
    };

    return res.status(200).json(response);
  } catch (error) {
    return res.json({
      code: error.statusCode,
      status: 'fail',
      message: error.message,
      data: 'null'
    });
  }
};
