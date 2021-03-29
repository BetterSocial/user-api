var express = require("express");
var router = express.Router();
const profileController = require("../controllers/profiles");

router.post("/changes-real-name/:id", profileController.changeRealName);
router.post("/changes-image/:id", profileController.changeImageProfile);
router.get("/get-my-profile/:id", profileController.getMyProfile);
router.get("/following/:id", profileController.following);
router.post("/set-following", profileController.setFollowing);
router.post("/unset-following", profileController.unSetFollowing);

module.exports = router;
