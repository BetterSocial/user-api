var express = require("express");
var router = express.Router();

const feed = require("./feeds");
const users = require("./users");
const whoToFollow = require("./whoToFollow");
const topics = require("./topics");
const locations = require("./locations");
const auth = require("../middlewares/auth");
const chat = require("../routes/chat");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.use("/activity", auth.isAuth, feed);
router.use("/users", users);
router.use("/topics", topics);
router.use("/location", locations);
router.use("/who-to-follow", whoToFollow);
router.use("/chat", chat);

module.exports = router;
