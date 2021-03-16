var express = require("express");
var router = express.Router();
const userHandler = require("./handler/users");
router.get("/verify-user", userHandler.verifyUser);
router.get("/test", userHandler.test);
module.exports = router;
