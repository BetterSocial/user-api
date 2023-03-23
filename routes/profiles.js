var express = require("express");
var router = express.Router();
const profileController = require("../controllers/profiles");
const Auth = require("../middlewares/auth");
const BodyValidationMiddleware = require("../middlewares/body-validation");

router.get("/get-other-profile/:id", profileController.getOtherProfile);
router.get("/get-other-profile-by-username/:username", Auth.isAuth, profileController.getOtherProfilebyUsername);
router.get("/get-profile/:username", profileController.getProfileByName);
router.get("/block/", Auth.isAuth, profileController.handleBlock);
router.post("/set-following", Auth.isAuth, profileController.setFollowing);
router.post("/unset-following", Auth.isAuth, profileController.unSetFollowing);
router.get("/self-feeds", Auth.isAuth, profileController.getSelfFeedsInProfile);
router.get("/feeds/:id", Auth.isAuth, profileController.getOtherFeedsInProfile);

router.post("/changes-real-name", profileController.changeRealName);
router.post("/changes-image", profileController.changeImageProfile);
router.delete("/remove-image", profileController.removeImageProfile);
router.get("/get-my-profile", Auth.isAuth, profileController.getMyProfile);
router.get("/following", Auth.isAuth, profileController.following);
router.post("/update-bio", Auth.isAuth, profileController.updateBio);

/**
 * TODO: remove this route if app api path has been reconfigured
 */
router.post("/changes-real-name/:id", profileController.changeRealName);
router.post("/changes-image/:id", profileController.changeImageProfile);
router.delete("/remove-image/:id", profileController.removeImageProfile);
router.get("/get-my-profile/:id", Auth.isAuth, profileController.getMyProfile);
router.get("/following/:id", Auth.isAuth, profileController.following);
router.post("/update-bio/:id", Auth.isAuth, profileController.updateBio);
/**
 * TODO END
 */

/**
 * Start of User Anonimity Changes
 */
router.post("/follow-user", Auth.isAuth, BodyValidationMiddleware.followUserV2, profileController.followUserV2);
router.post("/unfollow-user", Auth.isAuth, BodyValidationMiddleware.unfollowUserV2, profileController.unfollowUserV2);
/**
 * End of User Anonimity Changes
 */

module.exports = router;
