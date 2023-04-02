const jwt = require("jsonwebtoken");
const { User } = require("../databases/models");

module.exports.isAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null || token === undefined) {
    return res.status(401).json({
      code: 401,
      message: "Token not provided",
      data: null,
    });
  }

  jwt.verify(token, process.env.SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        code: 401,
        message: "Token invalid",
        data: null,
      });
    }

    req.user = user;
    req.userId = user.user_id;
    req.token = token;

    next();
  });
};

module.exports.isRefreshToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null || token === undefined) {
    return res.status(401).json({
      code: 401,
      message: "Token not provided",
      data: null,
    });
  }

  jwt.verify(token, process.env.SECRET_REFRESH_TOKEN, (err, user) => {
    if (err) {
      return res.status(401).json({
        code: 401,
        message: "Token invalid",
        data: null,
      });
    }

    req.user = user;
    req.userId = user.user_id;
    req.token = token;

    next();
  });
};

module.exports.isAuthUserAvailable = async (req, res, next) => {
  const user = await User.findOne({
    where: {
      user_id: req.userId,
      is_anonymous: false,
    },
  });

  if (user === null) {
    return res.status(404).json({
      code: 404,
      status: "error",
      message: "User not found",
    });
  }

  req.userModel = user;
  next();
}