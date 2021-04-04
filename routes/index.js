var express = require("express");
var router = express.Router();

const feed = require("./feeds");
const auth = require("../middlewares/auth");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.use("/activity", auth.isAuth, feed);

module.exports = router;
