require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

require("dotenv").config();

var usersRouter = require("./routes/users");
var topicsRouter = require("./routes/topics");
var locationsRouter = require("./routes/locations");
var whoToFollowRouter = require("./routes/whoToFollow");

var app = express();
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const verifyToken = require("./middlewares/verifyToken");

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/topics", topicsRouter);
app.use("/location", locationsRouter);
app.use("/who-to-follow", whoToFollowRouter);

module.exports = app;
