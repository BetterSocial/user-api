var express = require("express");
var router = express.Router();
const usersHandler = require("../controllers/users");
const auth = require("../middlewares/auth");

router.post("/check-username", usersHandler.checkUsername);
router.post("/register", usersHandler.register);
router.post("/verify-user", usersHandler.verifyUser);
router.get("/veryfy-token", usersHandler.veryfyToken);
router.get("/refresh-token", auth.isRefreshToken, usersHandler.refreshToken);
router.get(
  "/veryfy-token-getstream",
  auth.isAuth,
  usersHandler.varifyTokenGetstream
);
router.get("/showing-audience-estimates", usersHandler.showingAudience);

module.exports = router;
