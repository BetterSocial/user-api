const {getUnfilteredActivities} = require('../../services/getstream/getUnfilteredActivities');
const {generateCSV} = require('./helper');

module.exports = async (req, res) => {
  try {
    const activities = await getUnfilteredActivities(req);
    const csv = await generateCSV(activities);
    res.header('Content-Type', 'text/csv');
    res.attachment('user_activities.csv');
    return res.send(csv);
  } catch (e) {
    console.log(e.message);
    return res.status(403).json({
      code: 403,
      status: 'error ',
      message: 'e'
    });
  }
};
