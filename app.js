require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var swaggerUi = require("swagger-ui-express");

const swaggerApiDocumentation = require('./swagger/apiDocs.json')

const topicsRouter = require("./routes/topics");
const locationsRouter = require("./routes/locations");
const whoToFollowRouter = require("./routes/whoToFollow");
const usersRouter = require("./routes/users");
const profilesRouter = require("./routes/profiles");
const indexRouter = require("./routes/index");
const verifyToken = require("./middlewares/verifyToken");

const app = express();

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/topics", topicsRouter);
app.use("/location", locationsRouter);
app.use("/who-to-follow", whoToFollowRouter);
app.use("/profiles", profilesRouter);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerApiDocumentation));

module.exports = app;
