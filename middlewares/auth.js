const jwt = require("jsonwebtoken");
const { ApiKey } = require("../databases/models");
const { User } = require("../databases/models");
const UsersFunction = require("../databases/functions/users");

async function isAuthTokenValid(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
}

function createResponse(statusCode, message, data) {
  return {
    code: statusCode,
    message: message,
    data: data || null,
  };
}

module.exports.isAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
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

module.exports.isAuthAnonim = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  console.log({token})
  if (token === null || token === undefined) {
    return res.status(401).json(createResponse(401, "Token not provided"));
  }

  try {
    const tokenPayload = await isAuthTokenValid(token, process.env.SECRET);
    const user = await UsersFunction.findUserById(User, tokenPayload.user_id);
    if (!user || (user && !user.is_anonymous)) {
      return res.status(403).json(createResponse(403, "Forbidden access"));
    }

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

module.exports.isAuthUserAvailable = async (req, res, next) => {
  const user = await User.findOne({
    where: {
      user_id: req.userId,
      is_anonymous: false,
    },
  });

  if (user === null) {
    return res.status(404).json(createResponse(404, "User not found"));
  }

  req.userModel = user;
  next();
};
