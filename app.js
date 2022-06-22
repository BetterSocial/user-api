require("dotenv").config();
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var swaggerUi = require("swagger-ui-express");

const bodyParser = require("body-parser");

const swaggerApiDocumentation = require("./swagger/apiDocs.json");

const topicsRouter = require("./routes/topics");
const locationsRouter = require("./routes/locations");
const whoToFollowRouter = require("./routes/whoToFollow");
const usersRouter = require("./routes/users");
const profilesRouter = require("./routes/profiles");
const indexRouter = require("./routes/index");
const verifyToken = require("./middlewares/verifyToken");
const feedRouter = require("./routes/feeds");
const domainRouter = require("./routes/domain");
const chatRouter = require("./routes/chat");
const topicPage = require("./routes/topicPages");
const linkRouter = require("./routes/link");
const discovery = require('./routes/discovery')
const auth = require("./middlewares/auth");
const HomeRouter = require("./routes/home");

const app = express();
app.use('/', HomeRouter)

app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Please delete it when you start the sprint 3
app.use("/users", usersRouter);
app.use("/topics", topicsRouter);
app.use("/location", locationsRouter);
app.use("/who-to-follow", whoToFollowRouter);
app.use("/profiles", profilesRouter);
app.use("/u", linkRouter);

// app.use("/", indexRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/topics", topicsRouter);
app.use("/api/v1/location", locationsRouter);
app.use("/api/v1/who-to-follow", whoToFollowRouter);
app.use("/api/v1/profiles", profilesRouter);
app.use("/api/v1/feeds", feedRouter);
app.use("/api/v1/domain", domainRouter);
app.use("/api/v1/discovery", discovery);
app.use("/api/v1/u", linkRouter);
app.use(auth.isAuth, topicPage);

var options = {
  swaggerOptions: {
    authAction: {
      JWT: {
        name: "JWT",
        schema: {
          type: "apiKey",
          in: "header",
          name: "Authorization",
          description: "",
        },
        value: "Bearer <JWT>",
      },
    },
  },
};
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerApiDocumentation, options)
);
app.use("/api/v1", indexRouter);

// app.listen(3000, () => console.log('app started'))
module.exports = app;
