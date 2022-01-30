const {
  EVENT_CREATE_ACCOUNT,
  EVENT_CREATE_POST,
  EVENT_UPVOTE_POST,
  EVENT_CANCEL_UPVOTE_POST,
  EVENT_DOWNVOTE_POST,
  EVENT_CANCEL_DOWNVOTE_POST
} = require("./constant");

const scoringProcessQueue = require("./queueSenderForRedis"); // uncomment this line if using redis as message queue server
//const scoringProcessQueue = require("./queueSenderForKafka"); // uncomment this line if using kafka as message queue server

/*
 * Called when create account event.
 * Needed data:
 *   - user_id : text, id of the created user
 *   - register_time : time, when the account has registered
 *   - emails : array of text, optiional (can be empty), email list of the user
 *   - twitter_acc : text, optional (can be empty), twitter id account of the user
 *   - topics : array of bigint, optional (can be empty), id topics that followed by the user
 *   - follow_users : array of text, optional (can be empty), user ids that followed by the user
 */
const addForCreateAccount = async(data) => {
  console.debug("addForCreateAccount called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_CREATE_ACCOUNT, data);
  return 1;
}

/*
 * Called when create post event.
 * Needed data:
 *   - post_id : text, id of the created post
 *   - author_id : text, user id of the author
 *   - topics : array of text, optional (can be empty), list of topics tagged in the post
 *   - content : text, content of the post
 *   - posting_time : time, when the author submit the post
 *   - exp_setting : text, expiration setting
 *   - is_anonymous : boolean, whether the author choose as anonymous post
 * 
 */
const addForCreatePost = async(data) => {
  console.debug("addForCreatePost called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_CREATE_POST, data);
  return 1;
}

/*
 * Called when create comment event.
 * Needed data:
 *   - comment_id : text, id of the created comment
 *   - post_id : text, id of the created post
 *   - author_id : text, user id of the author
 *   - content : text, content of the post
 *   - posting_time : time, when the author submit the comment
 * 
 */
const addForCreateComment = async(data) => {
  console.debug("addForCreateComment called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_CREATE_, data);
  return 1;
}

module.exports = {
  addForCreateAccount,
  addForCreatePost,
  addForCreateComment,
};
