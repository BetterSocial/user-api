var express = require("express");
var router = express.Router();

// controller
const {
  getDomain,
  getDetailDomain,
  getProfileDomain,
  followDomain,
} = require("../controllers/domain");
const { isAuth } = require("../middlewares/auth");

router.get("/", getDomain);
router.get("/domain/:idfeed", getDetailDomain);
router.get("/profile-domain/:name", getProfileDomain);
router.post("/follow", isAuth, followDomain);

module.exports = router;
