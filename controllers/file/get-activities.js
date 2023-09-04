const {Parser} = require('@json2csv/plainjs');
const {getUnfilteredActivities} = require('../../services/getstream/getUnfilteredActivities');

module.exports = async (req, res) => {
  try {
    const data = [];
    const activities = await getUnfilteredActivities(req);
    for (const activity of activities.data) {
      data.push({
        id: activity.id,
        message: activity.message,
        topics: activity.topics,
        origin: activity.origin,
        time: activity.time,
        expired_at: activity.expired_at,
        show_to_user: activity.show_to_user,
        unshow_reason: activity.unshow_reason,
        source_feed: activity.source_feed
      });
    }
    const fields = [
      {
        label: 'Id',
        value: 'id'
      },
      {
        label: 'Date',
        value: 'time'
      },
      {
        label: 'Expired At',
        value: 'expired_at'
      },
      {
        label: 'Show in app?',
        value: 'show_to_user'
      },
      {
        label: 'Reason if not shown in app',
        value: 'unshow_reason'
      },
      {
        label: 'Source feed',
        value: 'source_feed'
      },
      {
        label: 'Origin',
        value: 'origin'
      },
      {
        label: 'Topics',
        value: 'topics'
      },
      {
        label: 'Message',
        value: 'message'
      }
    ];

    const json2csv = new Parser({fields});
    const csv = json2csv.parse(data);
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
