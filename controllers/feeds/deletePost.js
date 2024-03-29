const getstreamService = require('../../services/getstream');
const Getstream = require('../../vendor/getstream');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
module.exports = async (req, res) => {
  const {postId} = req.params;
  const token = req.token;
  const userId = req.userId;

  const getstreamQueryResult = await getstreamService.getFeeds(token, 'user_excl', {
    ids: [postId]
  });

  const [feed] = getstreamQueryResult?.results || {};
  if (feed?.actor?.id !== userId) {
    return res.status(200).json({
      success: false,
      message: 'You are not authorized to delete this post'
    });
  }

  try {
    const getstreamDeleteResult = await getstreamService.deleteFeedById({
      feedGroup: 'user_excl',
      activityId: postId,
      userId,
      token
    });
    const getstreamDeleteNotificationFeed = await Getstream.feed.deleteNotificationFeed(
      userId,
      postId
    );
    console.log(getstreamDeleteNotificationFeed);
    return res.status(200).json({
      success: getstreamDeleteResult ? true : false
    });
  } catch (e) {
    return res.status(200).json({
      success: false,
      message: e
    });
  }
};
