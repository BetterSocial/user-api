var express = require("express");
var router = express.Router();
const checkUsernameHendler = require("../controllers/users");

const auth = require("../middlewares/auth");

router.post("/check-username", checkUsernameHendler.checkUsername);
router.post("/register", checkUsernameHendler.register);
router.post("/verify-user", checkUsernameHendler.verifyUser);
router.get("/veryfy-token", checkUsernameHendler.veryfyToken);
router.get(
  "/refresh-token",
  auth.isRefreshToken,
  checkUsernameHendler.refreshToken
);

module.exports = router;
