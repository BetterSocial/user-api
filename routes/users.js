var express = require("express");
var router = express.Router();
const userHandler = require("./handler/users");
router.get("/login", userHandler.create);
router.get("/test", userHandler.test);
module.exports = router;
