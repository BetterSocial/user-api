var express = require("express");
var router = express.Router();

// controller
const { createQueueNews } = require("../controllers/news/createNews");

router.post("/post-queue", createQueueNews);

module.exports = router;
