const {User} = require('../../databases/models');
const {Parser} = require('@json2csv/plainjs');
const {getDb} = require('../../databases/config/mongodb_conn');
const {DB_COLLECTION_USER_SCORE} = require('../../services/score/constant');

const getUserScoreDetails = async (authorId) => {
  const db = await getDb();
  const userScoreList = await db.collection(DB_COLLECTION_USER_SCORE);
  const userScoreDoc = await userScoreList.findOne({_id: authorId});
  return userScoreDoc;
};

const generateCSV = async (users) => {
  const data = [];
  const userScores = {};

  for (const user of users) {
    if (!(user.user_id in userScores)) {
      userScores[user.user_id] = await getUserScoreDetails(user.user_id);
    }
    data.push({
      id: user.user_id,
      username: user.username,
      combined_user_score: user.combined_user_score,
      karma_score: user.karma_score,
      user_score_details: userScores[user.user_id]
    });
  }
  const fields = [
    {label: 'User ID', value: 'id'},
    {label: 'Username', value: 'username'},
    {label: 'Combined User Score', value: 'combined_user_score'},
    {label: 'Karma Score', value: 'karma_score'},
    {label: 'User Score Details', value: 'user_score_details'}
  ];
  const json2csv = new Parser({fields});
  const csv = json2csv.parse(data);
  return csv;
};

module.exports = async (req, res) => {
  try {
    const users = await User.findAll({
      order: [
        ['is_anonymous', 'ASC'],
        ['karma_score', 'DESC']
      ]
    });
    const csv = await generateCSV(users);
    res.header('Content-Type', 'text/csv');
    res.attachment(`users_karma_score.csv`);
    return res.send(csv);
    // return res.json({
    //   code: 200,
    //   status: 'success'
    // });
  } catch (error) {
    console.error(error);
    res.status(403).json({
      code: 403,
      status: 'error',
      message: error.message
    });
  }
};
