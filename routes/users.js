var express = require("express");
var router = express.Router();
const checkUsernameHendler = require("../controllers/users");

router.post("/check-username", checkUsernameHendler.checkUsername);

module.exports = router;
