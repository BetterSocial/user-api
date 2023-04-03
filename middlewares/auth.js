const { next } = require("cli");
const jwt = require("jsonwebtoken");
const { ApiKey } = require("../databases/models");

module.exports.isAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null || token === undefined) {
    return res.status(401).json(createResponse(401, "Token not provided"));
  }

  try {
    const user = await isAuthTokenValid(token, process.env.SECRET);
    req.user = user;
    req.userId = user.user_id;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json(createResponse(401, "Token invalid"));
  }
};

module.exports.isRefreshToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null || token === undefined) {
    return res.status(401).json(createResponse(401, "Token not provided"));
  }

  try {
    const user = await isAuthTokenValid(
      token,
      process.env.SECRET_REFRESH_TOKEN
    );
    req.user = user;
    req.userId = user.user_id;
    req.token = token;
    next();
  } catch (err) {
    return res.status(401).json(createResponse(401, "Token invalid"));
  }
};

async function getLatestApiKey() {
  return ApiKey.findOne({
    order: [["createdAt", "DESC"]],
  });
}

module.exports.isAdminAuth = async (req, res, next) => {
  const authHeader = req.headers["api-key"];
  const apiKey = await getLatestApiKey();
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json(createResponse(401, "Api Key not provided"));
  }
  if (authHeader !== apiKey.key) {
    return res.status(401).json(createResponse(401, "Api Key invalid"));
  }
  next();
};

module.exports.isAdminAuth = async (req, res, next) => {
  const authHeader = req.headers["api-key"];
  let apiKey = await ApiKey.findOne({
    order: [["createdAt", "DESC"]],
  });
  console.log("key: ", apiKey.key);
  if (authHeader === null || authHeader === undefined) {
    return res.status(401).json({
      code: 401,
      message: "Api Key not provide",
      data: null,
    });
  }
  if (authHeader != apiKey.key) {
    return res.status(401).json({
      code: 401,
      message: "Api Key invalid",
      data: null,
    });
  }
  next();
};
