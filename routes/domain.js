var express = require("express");
var router = express.Router();

// controller
const { getDomain, getDetailDomain } = require("../controllers/domain")

router.get("/", getDomain);
router.get("/:name/:idfeed", getDetailDomain);

module.exports = router;
