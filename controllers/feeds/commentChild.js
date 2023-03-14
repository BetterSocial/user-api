const { commentChild } = require("../../services/getstream");
const QueueTrigger = require("../../services/queue/trigger");
const {messaging, firestore} = require('firebase-admin')
const { FcmToken, User, Post } = require("../../databases/models");

module.exports = async (req, res) => {
  try {
    let { reaction_id, message, sendPostNotif, postMaker } = req?.body;

    let result = await commentChild(reaction_id, req.userId, req.body.useridFeed, message, req.token, sendPostNotif, req.body.postMaker);

    QueueTrigger.addCommentToDb({
      authorUserId: postMaker,
      comment: message,
      commenterUserId: req?.userId,
      commentId: result?.id,
      postId: result?.activity_id
    })
     const detailUser = await User.findOne({
      where: {
        user_id: req.body.useridFeed
      }
    })
    const detailSendUser = await User.findOne({
      where: {
        user_id: req.userId
      }
    })
    const userToken = await FcmToken.findOne({
            where: {
                user_id: req.body.useridFeed
            }
        })
        const getBadge = await firestore().collection(`${process.env.ENVIRONMENT}UserBadge`).doc(req.body.useridFeed).get()
    const {badgeCount} = await getBadge.data()
    console.log(badgeCount, 'susu')
    const payload = {
    notification: {
      title: `${detailSendUser.username}  replied to your comment on ${req.body.postTitle ? req.body.postTitle.substring(0, 50) : ''}`,
      body: message,
      click_action: "OPEN_ACTIVITY_1",
      image: detailUser.profile_pic_path,
      badge: String(badgeCount + 1)
    },
    data: {
      feed_id: req.body.activityId,
      type: 'reaction'
    }
  };
      if(userToken) {
        if(detailUser.user_id !== detailSendUser.user_id) {
          messaging().sendToDevice(userToken.token, payload).then((res) => {
            console.log(res,'hehe')
          })
        }
     
    } 
    return res.status(200).json({
      code: 200,
      status: "Success comment child",
      data: result,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      code: 400,
      status: String(e),
      data: err.detail,
    });
  }
};
