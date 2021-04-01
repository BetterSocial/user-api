var express = require("express");
var router = express.Router();

// controller
const feedController = require("../controllers/feeds/FeedController");

const feed = require("../controllers/feeds");

router.post("/post", feed.createPost);
router.post("/create-token", feedController.createToken);
router.get("/feeds", feed.getFeeds);
router.post("/reaction", feedController.reaction);
router.get("/reactions", feedController.getReaction);
router.post("/follow-user", feed.followUser);

module.exports = router;
