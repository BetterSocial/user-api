module.exports = {
  EVENT_CREATE_ACCOUNT: "create-account",
  EVENT_CREATE_POST: "create-post",
  EVENT_UPVOTE_POST: "upvote-post",
  EVENT_CANCEL_UPVOTE_POST: "cancel-upvote-post",
  EVENT_DOWNVOTE_POST: "downvote-post",
  EVENT_CANCEL_DOWNVOTE_POST: "cancel-downvote-post",
  EVENT_BLOCK_USER_POST: "block-user-post",
  EVENT_COMMENT_POST: "comment-post",
  EVENT_VIEW_POST: "view-post",
  EVENT_FOLLOW_USER: "follow-user",
  EVENT_UNFOLLOW_USER: "unfollow-user",
  EVENT_UNBLOCK_USER: "unblock-user",

  QUEUE_ADD_USER_POST_COMMENT: "addUserPostComment",
  QUEUE_DELETE_USER_POST_COMMENT: "deleteUserPostComment",

  DB_COLLECTION_USER_POST_SCORE: "user_post_score",
  EVENT_FOLLOW_F2_USER: "follow-f2-users",
  EVENT_UNFOLLOW_F2_USER: "unfollow-f2-users",
  EVENT_SYNC_FEED: "syncUserFeedQueue",
};
