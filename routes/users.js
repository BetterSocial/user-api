var express = require("express");
var router = express.Router();
const checkUsernameHendler = require("./handler/users");
router.post("/check-username", checkUsernameHendler.checkUsername);

module.exports = router;
