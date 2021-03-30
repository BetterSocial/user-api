var express = require("express");
var router = express.Router();

// controller
const feedController = require("../controllers/feeds/FeedController");

router.post("/post", feedController.createPostFeed);
router.post("/create-token", feedController.createToken);
router.get("/posts", feedController.getPost);
router.post("/reaction", feedController.reaction);
router.get("/reactions", feedController.getReaction);

module.exports = router;
