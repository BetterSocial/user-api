const {Topics, User, FcmToken} = require('../../databases/models');
const {messaging} = require('firebase-admin');

module.exports = async (req, res) => {
  try {
    let response;
    let {member_ids, topic_id} = req.body;

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

        let userToken = await FcmToken.findOne({
          where: {
            user_id
          }
        });

        const payload = {
          notification: {
            title: `${user.username} invited you to join ${topics.name} community`,
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
