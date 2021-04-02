//fungsi sementara untuk ngecek apakah Exchange Token dikirimkan dari mobile

module.exports = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(403).json({ message: "empty token" });
  }
  req.token = token;
  return next();
};
