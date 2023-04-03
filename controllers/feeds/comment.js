const { comment } = require("../../services/getstream");
const { addForCommentPost } = require("../../services/score");
const moment = require("moment");
const QueueTrigger = require("../../services/queue/trigger");
const {messaging, firestore} = require('firebase-admin')
const { FcmToken, User } = require("../../databases/models");

module.exports = async (req, res) => {
  try {
    let body = req.body;
    body = { ...body, kind: 'comment', userid: req.userId }
    let result = await comment(body.activity_id, req.userId, body.useridFeed, body.message, req.token, body.sendPostNotif);
    const { countProcess } = require("../../process");
    // save to db if character message > 80
    if (body.message.length > 80) {
      await countProcess(body.activity_id, { comment_count: +1 }, { comment_count: 1 });
    }
    let detailUser = {}
    if(req.body.useridFeed) {
      detailUser = await User.findOne({
      where: {
        user_id: req.body.useridFeed
      }
    })
    }
    const detailSendUser = await User.findOne({
      where: {
        user_id: req.userId
      }
    })
    let userToken = null
    if(req.body.useridFeed) {
          userToken = await FcmToken.findOne({
            where: {
                user_id: req.body.useridFeed
            }
        })
    }
    // const getBadge = await firestore().collection(`${process.env.ENVIRONMENT}UserBadge`).doc(req.body.useridFeed).get()
    // const {badgeCount} = await getBadge.data()
    const payload = {
    notification: {
      title: `${detailSendUser.username} commented on your post`,
      body: body.message,
      click_action: "OPEN_ACTIVITY_1",
      image: detailUser.profile_pic_path,
      // badge: String(badgeCount + 1)
    },
    data: {
      feed_id: body.activity_id,
      type: 'feed'
    }
  };
    if(userToken) {
      if(detailUser.user_id !== detailSendUser.user_id) {
        messaging().sendToDevice(userToken.token, payload).then((res) => {
      })
      }
  
    }   
    // send queue for scoring processing on comment a post
    const scoringProcessData = {
      comment_id: result.id,
      user_id: req.userId,
      feed_id: body.activity_id,
      message: body.message,
      activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
    };
    await addForCommentPost(scoringProcessData);

    QueueTrigger.addCommentToDb({
      authorUserId: body?.useridFeed,
      comment: body?.message,
      commenterUserId: req?.userId,
      commentId: result?.id,
      postId: body?.activity_id
    })

    return res.status(200).json({
      code: 200,
      status: "Success comment",
      data: result,
    });
  } catch (err) {
    return res.status(400).json({
      code: 400,
      message: String(err),
      data: err.detail,
    });
  }
};
