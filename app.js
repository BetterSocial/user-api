require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var topicsRouter = require("./routes/topics");
var locationsRouter = require("./routes/locations");
var whoToFollowRouter = require("./routes/whoToFollow");

const usersRouter = require("./routes/users");
const indexRouter = require("./routes/index");
const verifyToken = require("./middlewares/verifyToken");

const app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));


// app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/topics", topicsRouter);
app.use("/location", locationsRouter);
app.use("/who-to-follow", whoToFollowRouter);

module.exports = app;
