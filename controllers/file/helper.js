const {Parser} = require('@json2csv/plainjs');
const {getDb} = require('../../databases/config/mongodb_conn');
const {DB_COLLECTION_USER_SCORE} = require('../../services/score/constant');

const formattedScoreDetails = (data) => {
  if (data) {
    delete data.topics;
    delete data.u_score;
  }
  return data;
};

const getUserScoreDetails = async (authorId) => {
  const db = await getDb();
  const userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);
  const userScoreDoc = await userScoreList.findOne({_id: authorId});
  return userScoreDoc;
};

const generateCSV = async (activities) => {
  const data = [];
  const userScores = {};

  for (const activity of activities.data) {
    if (!(activity.actor.id in userScores)) {
      userScores[activity.actor.id] = await getUserScoreDetails(activity.actor.id);
    }
    data.push({
      id: activity.id,
      message: activity.message,
      topics: activity.topics,
      origin: activity.origin,
      time: activity.time,
      expired_at: activity.expired_at,
      show_to_user: activity.show_to_user,
      unshow_reason: activity.unshow_reason,
      source_feed: activity.source_feed,
      final_score: activity.final_score,
      user_score: activity.user_score,
      score_details: formattedScoreDetails(activity.score_details),
      user_score_details: userScores[activity.actor.id]
    });
  }
  const fields = [
    {label: 'Id', value: 'id'},
    {label: 'Date', value: 'time'},
    {label: 'Expired At', value: 'expired_at'},
    {label: 'Show in app?', value: 'show_to_user'},
    {label: 'Reason if not shown in app', value: 'unshow_reason'},
    {label: 'Source feed', value: 'source_feed'},
    {label: 'Origin', value: 'origin'},
    {label: 'Actor', value: 'actor'},
    {label: 'Topics', value: 'topics'},
    {label: 'Message', value: 'message'},
    {label: 'Post Score', value: 'final_score'},
    {label: 'User Score', value: 'user_score'},
    {label: 'Score Details', value: 'score_details'},
    {label: 'User Score Details', value: 'user_score_details'}
  ];
  const json2csv = new Parser({fields});
  const csv = json2csv.parse(data);
  return csv;
};

module.exports = {generateCSV};
