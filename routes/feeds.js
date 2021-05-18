var express = require("express");
var router = express.Router();

// controller
const feedController = require("../controllers/feeds/FeedController");

const feed = require("../controllers/feeds");

router.post("/post", feed.createPost);
router.post("/post/poll", feed.createPollPost);
router.post("/create-token", feedController.createToken);
router.get("/feeds", feed.getFeeds);
router.post("/reaction", feed.createReaction);
router.get("/reactions", feed.getReaction);
router.post("/follow-user", feed.followUser);
router.post("/upvote", feed.upvote);
router.post("/downvote", feed.downvote);
router.post("/comment", feed.comment);
router.post("/comment-child", feed.commentChild);
router.post("/like", feed.like);
router.post("/delete-feed", feed.deleteFeed);
router.get("/user", feed.getFeedUser);
router.post("/child-upvote", feed.childUpvote);
router.post("/child-downvote", feed.childDownvote);
router.post("/update-reaction", feed.updateReaction);
router.post("/delete-reaction", feed.deleteReaction);

module.exports = router;
