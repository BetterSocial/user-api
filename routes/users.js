var express = require("express");
var router = express.Router();
const checkUsernameHendler = require("../controllers/users");

router.post("/check-username", checkUsernameHendler.checkUsername);
router.post("/register", checkUsernameHendler.register);
router.post("/verify-user", checkUsernameHendler.verifyUser);
router.get("/veryfy-token", checkUsernameHendler.veryfyToken);

module.exports = router;
