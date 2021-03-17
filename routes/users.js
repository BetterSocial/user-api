var express = require("express");
var router = express.Router();
const userHendler = require("./handler/users");
router.post("/check-username", userHendler.checkUsername);
router.post("/register", userHendler.register);

module.exports = router;
