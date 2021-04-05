var express = require("express");
var router = express.Router();

// controller
const feedController = require("../controllers/feeds/FeedController");

const feed = require("../controllers/feeds");

router.post("/post", feed.createPost);
router.post("/create-token", feedController.createToken);
router.get("/feeds", feed.getFeeds);
router.post("/reaction", feed.createReaction);
router.get("/reactions", feed.getReaction);
router.post("/follow-user", feed.followUser);
router.post("/upvote", feed.upvote);
router.post("/comment", feed.comment);
router.post("/like", feed.like);

module.exports = router;
