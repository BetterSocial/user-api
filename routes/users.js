var express = require("express");
var router = express.Router();
const userHandler = require("./handler/users");
router.post("/verify-user", userHandler.verifyUser);
router.get("/veryfy-token", userHandler.veryfyToken);

module.exports = router;
