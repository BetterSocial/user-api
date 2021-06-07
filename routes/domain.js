var express = require("express");
var router = express.Router();

// controller
const { getDomain } = require("../controllers/domain")

router.get("/", getDomain);

module.exports = router;
