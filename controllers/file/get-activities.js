const {getUnfilteredActivities} = require('../../services/getstream/getUnfilteredActivities');
const {generateCSV} = require('./helper');

module.exports = async (req, res) => {
  try {
    const activities = await getUnfilteredActivities(req);
    const csv = await generateCSV(activities);
    res.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename=user_activities.csv'
    });
    res.download(csv);
  } catch (error) {
    console.error(error);
    res.status(403).json({
      code: 403,
      status: 'error',
      message: error.message
    });
  }
};
