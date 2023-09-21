const moment = require('moment');
const {addForUnblockUser} = require('../../score');

const BetterSocialScoreUnblockUser = (selfUserId, targetUserId) => {
  const scoringProcessData = {
    user_id: selfUserId,
    feed_id: '',
    unblocked_user_id: targetUserId,
    activity_time: moment().utc().format('YYYY-MM-DD HH:mm:ss')
  };

  addForUnblockUser(scoringProcessData).catch((e) => {
    console.log('Error in adding unblock user score');
    console.log(e);
  });
};

module.exports = BetterSocialScoreUnblockUser;
