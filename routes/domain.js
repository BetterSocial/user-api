var express = require("express");
var router = express.Router();

// controller
const {
  getDomain,
  getDetailDomain,
  getProfileDomain,
} = require("../controllers/domain");

router.get("/", getDomain);
router.get("/domain/:idfeed", getDetailDomain);
router.get("/profile-domain/:name", getProfileDomain);

module.exports = router;
