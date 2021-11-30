const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat/ChatController");

const auth = require("../middlewares/auth");

router.get("/create-channel", chatController.createChannel);
router.post("/add-moderator", chatController.addChannelModerator);
router.post("/add-members-channel", auth.isAuth, chatController.addMembers);

module.exports = router;
