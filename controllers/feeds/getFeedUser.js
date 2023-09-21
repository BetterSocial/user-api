const getstreamService = require('../../services/getstream');
module.exports = async (req, res) => {
  const token = req.token;
  getstreamService
    .getFeeds(token, 'user', '')
    .then((result) => {
      let data = [];
      result.results.map((item, index) => {
        let now = new Date();
        let dateActivity = new Date(item.expired_at);
        if (now < dateActivity) {
          data.push(item);
        }
      });
      res.status(200).json({
        code: 200,
        status: 'success',
        data: {
          results: data,
          next: result.next,
          duration: result.duration
        }
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(403).json({
        status: 'failed',
        data: null,
        error: err
      });
    });
};
