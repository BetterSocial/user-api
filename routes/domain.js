var express = require("express");
var router = express.Router();

const {
  getDomain,
  getDetailDomain,
  getFollowedDomain,
  getProfileDomain,
  followDomain,
  iFollow,
  unfollowDomain,
  getBlockedDomain,
  unblockDomain,
  getSingleBlockedDomain


} = require("../controllers/domain");
const { isAuth } = require("../middlewares/auth");

router.get("/", isAuth, getDomain);
router.get("/followed", isAuth, getFollowedDomain);
router.get("/blocked", isAuth, getBlockedDomain);
router.get("/domain/:idfeed", getDetailDomain);
router.get("/profile-domain/:name", getProfileDomain);
router.post("/follow", isAuth, followDomain);
router.post("/unfollow", isAuth, unfollowDomain);
router.get("/ifollow", isAuth, iFollow);
router.post("/unblock", isAuth, unblockDomain);
router.get("/check-blocked/:domainId", isAuth, getSingleBlockedDomain);

module.exports = router;
