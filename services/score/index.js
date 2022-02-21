const {
  EVENT_CREATE_ACCOUNT,
  EVENT_CREATE_POST,
  EVENT_CREATE_COMMENT,
  EVENT_UPVOTE_POST,
  EVENT_CANCEL_UPVOTE_POST,
  EVENT_DOWNVOTE_POST,
  EVENT_CANCEL_DOWNVOTE_POST,
  EVENT_BLOCK_USER_POST,
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
 * Called when someone upvote a feed.
 * Needed data:
 *   - user_id: text, id of the user who doing the upvote action
 *   - feed_id: text, id of the feed which being upvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const addForUpvoteFeed = async(data) => {
  console.debug("addForUpvoteFeed called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_UPVOTE_POST, data);
  return 1;
}

/*
 * Called when someone undo/cancel upvote a feed.
 * Needed data:
 *   - user_id: text, id of the user who doing the action
 *   - feed_id: text, id of the feed which being cancel-upvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const addForCancelUpvoteFeed = async(data) => {
  console.debug("addForCancelUpvoteFeed called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_CANCEL_UPVOTE_POST, data);
  return 1;
}

/*
 * Called when someone downvote a feed.
 * Needed data:
 *   - user_id: text, id of the user who doing the downvote action
 *   - feed_id: text, id of the feed which being downvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const addForDownvoteFeed = async(data) => {
  console.debug("addForDownvoteFeed called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_DOWNVOTE_POST, data);
  return 1;
}

/*
 * Called when someone undo/cancel downvote a feed.
 * Needed data:
 *   - user_id: text, id of the user who doing the action
 *   - feed_id: text, id of the feed which being cancel-downvoted
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const addForCancelDownvoteFeed = async(data) => {
  console.debug("addForCancelDownvoteFeed called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_CANCEL_DOWNVOTE_POST, data);
  return 1;
}

/*
 * Called when someone block someone else, either by it's post or not
 * Needed data:
 *   - user_id: text, id of the user who doing the action
 *   - feed_id: text, optional, id of the feed which being blocked
 *   - blocked_user_id: text, optional, id of the user which being blocked
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const addForBlockUser = async(data) => {
  console.debug("addForBlockUser called with data [" + JSON.stringify(data) + "]");
  scoringProcessQueue.sendQueue(EVENT_BLOCK_USER_POST, data);
  return 1;
}

/*
 * Called when someone block anonymous post
 * Needed data:
 *   - user_id: text, id of the user who doing the action
 *   - feed_id: text, id of the feed which being blocked
 *   - activity_time: text, date and time when activity is done in format "YYYY-MM-DD HH:mm:ss"
 */
const addForBlockAnonymousPost = async(data) => {
  console.debug("addForBlockAnonymousPost called with data [" + JSON.stringify(data) + "]");
  data.blocked_user_id = "";
  scoringProcessQueue.sendQueue(EVENT_BLOCK_USER_POST, data);
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
  addForUpvoteFeed,
  addForCancelUpvoteFeed,
  addForDownvoteFeed,
  addForCancelDownvoteFeed,
  addForBlockUser,
  addForBlockAnonymousPost,
  addForCreateComment,
};
