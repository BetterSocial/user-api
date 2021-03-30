var express = require("express");
var router = express.Router();
const profileController = require("../controllers/profiles");

router.post("/changes-real-name/:id", profileController.changeRealName);
router.post("/changes-image/:id", profileController.changeImageProfile);
router.delete("/remove-image/:id", profileController.removeImageProfile);
router.get("/get-my-profile/:id", profileController.getMyProfile);
router.get("/get-other-profile/:id", profileController.getOtherProfile);
router.get("/update-bio/:id", profileController.updateBio);
router.get("/following/:id", profileController.following);
router.post("/set-following", profileController.setFollowing);
router.post("/unset-following", profileController.unSetFollowing);

module.exports = router;
