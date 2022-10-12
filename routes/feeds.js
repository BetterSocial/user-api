var express = require("express");
var router = express.Router();

// controller
const feedController = require("../controllers/feeds/FeedController");

const feed = require("../controllers/feeds");
const { isAuth } = require("../middlewares/auth");

router.post("/post", feed.createPost);
router.post("/post/poll", feed.createPollPost);
router.post("/post/poll/input", feed.inputPoll);
router.post("/create-token", feedController.createToken);
router.get("/feeds", feed.getFeeds);
router.post("/reaction", feed.createReaction);
router.get("/reactions", feed.getReaction);
router.post("/follow-user", feed.followUser);
router.post("/upvote", feed.upvote);
router.post("/downvote", feed.downvote);
router.post("/comment", feed.comment);
router.post("/child-comment", feed.commentChild);
router.post("/like", feed.like);
router.post("/delete-feed", feed.deleteFeed);
router.get("/user", feed.getFeedUser);
router.post("/child-upvote", feed.childUpvote);
router.post("/child-downvote", feed.childDownvote);
router.post("/update-reaction", feed.updateReaction);
router.post("/delete-reaction", feed.deleteReaction);
router.post("/update-activity", feed.putMainFeed);
router.get("/detail-feed", isAuth, feed.detailFeed);
router.post("/upvote-domain", feed.upVoteDomain);
router.post("/downvote-domain", feed.downVoteDomain);
router.post("/viewpost", feed.createQueuePostTime);
router.post("/vote_comment", isAuth, feed.voteComment);
router.get("/i_vote_comment", isAuth, feed.iVoteComment);
router.get("/feed-chat/", isAuth, feed.getFeedChatService)
router.post("/open-graph", isAuth, feed.getOpenGraph)

router.post("/feed-action-notification/:kind", isAuth, feed.notificationCommentFeed)

module.exports = router;
