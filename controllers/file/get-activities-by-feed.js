const {
  getUnfilteredActivitiesByFeed,
} = require("../../services/getstream/getUnfilteredActivitiesByFeed");
const { generateCSV } = require("./helper");

module.exports = async (req, res) => {
  try {
    const { feedgroup, feedid } = req.query;
    if (!feedgroup || !feedid) {
      return res.status(403).json({
        code: 403,
        status: "error ",
        message: "feedgroup and feedid is required",
      });
    }
    const activities = await getUnfilteredActivitiesByFeed(req);
    const csv = await generateCSV(activities);
    res.header("Content-Type", "text/csv");
    res.attachment(`activities_from_${feedgroup}:${feedid}.csv`);
    return res.send(csv);
  } catch (e) {
    console.log(e.message);
    console.log(e);
    return res.status(403).json({
      code: 403,
      status: "error ",
      message: "e",
    });
  }
};
