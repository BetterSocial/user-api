const {getUnfilteredActivities} = require('../../services/getstream/getUnfilteredActivities');

module.exports = async (req, res) => {
  let {offset = 0, feed = 'main_feed_following'} = req.query;
  let data = null;
  try {
    const result = await getUnfilteredActivities(req, res);
    data = result.data;
    offset = result.offset;
    feed = result.feed;
    return res.status(200).json({
      code: 200,
      status: 'success',
      data,
      offset,
      feed
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data,
      offset,
      feed,
      message: 'Internal server error',
      error
    });
  }
};
