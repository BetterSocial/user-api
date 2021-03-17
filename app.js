var express = require("express");
var bodyParser = require('body-parser')
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var locationsRouter = require("./routes/locations");

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const verifyToken = require("./middlewares/verifyToken");

app.use("/", indexRouter);
app.use("/users", verifyToken, usersRouter);
app.use("/location", locationsRouter);

module.exports = app;
