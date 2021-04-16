const getstreamService = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    const token = req.token;

    getstreamService
      .getFeeds(token)
      .then((result) => {
        console.log(result);
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
          status: "success",
          data: {
            results: data,
            next: result.next,
            duration: result.duration,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.status(403).json({
          status: "failed",
          data: null,
          error: err,
        });
      });
  } catch (error) {
    return res.status(500).json({
      code: status,
      data: null,
      message: "Internal server error",
      error: error,
    });
  }
};
