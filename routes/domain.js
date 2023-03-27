const express = require("express");
const router = express.Router();

const {
  getDomain,
  getFollowedDomain,
  getProfileDomain,
  followDomain,
  iFollow,
  unfollowDomain,
  getBlockedDomain,
  unblockDomain,
  getSingleBlockedDomain,
  getDetailDomain,
  getLinkContextScreenRelatedArticles


} = require("../controllers/domain");
const { getDetailDomainHandle } = require("../controllers/domain/detailDomain");
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
router.get("/detail/:domainId", isAuth, getDetailDomainHandle);
router.get("/link-context-screen/:news_link_id", isAuth, getLinkContextScreenRelatedArticles);

module.exports = router;
