const {
  EVENT_CREATE_ACCOUNT,
  EVENT_CREATE_POST,
  EVENT_CREATE_COMMENT,
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
 *   - feed_id: text, id of the created post/feed from getstream
 *   - foreign_id : text, id of the created post/feed from our system
 *   - time: text, post/feed creation time from getstream, in format "2014-11-11T14:06:30.494"
 *       (reference: https://getstream.io/activity-feeds/docs/node/adding_activities/?language=javascript)
 *   - user_id: text, id of the author of this post/feed
 *   - message: text, content of the post/feed
 *   - topics: array of text, optional (can be empty), list of topic tagged for this post/feed
 *   - privacy: text, privacy configuration of this post/feed.
 *   - anonimity: boolean, whether the post created as anonymous user
 *   - location_level: text, level of location targeted by the author
 *   - duration_feed: text, duration configuration of this post/feed
 *   - images_url: array of text, optional (can be empty), list of media URLs (video/image) in this post/feed
 *   - poll_id: int, optional (could be not set), id of polling in the post
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
  scoringProcessQueue.sendQueue(EVENT_CREATE_COMMENT, data);
  return 1;
}

module.exports = {
  addForCreateAccount,
  addForCreatePost,
  addForCreateComment,
};
