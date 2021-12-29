var express = require("express");
var router = express.Router();
const profileController = require("../controllers/profiles");
const Auth = require("../middlewares/auth");

router.post("/changes-real-name/:id", profileController.changeRealName);
router.post("/changes-image/:id", profileController.changeImageProfile);
router.delete("/remove-image/:id", profileController.removeImageProfile);
router.get("/get-my-profile/:id", profileController.getMyProfile);
router.get("/get-other-profile/:id", profileController.getOtherProfile);
router.get("/get-other-profile-by-username/:username", Auth.isAuth, profileController.getOtherProfilebyUsername);
router.get("/get-profile/:username", profileController.getProfileByName);
router.post("/update-bio/:id", profileController.updateBio);
router.get("/following/:id", profileController.following);
router.get("/block/", Auth.isAuth, profileController.handleBlock);
router.post("/set-following", profileController.setFollowing);
router.post("/unset-following", profileController.unSetFollowing);
router.get("/self-feeds", Auth.isAuth, profileController.getSelfFeedsInProfile);
router.get("/feeds/:id", Auth.isAuth, profileController.getOtherFeedsInProfile);

module.exports = router;
