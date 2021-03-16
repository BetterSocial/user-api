const { User } = require("../../../database/models");
module.exports = async (req, res) => {
  if (!req.body.username) {
    res.json({
      status: "error",
      code: 404,
      message: "username not found",
    });
  }
  const data = await User.count({
    where: { username: req.body.username },
  });
  res.json({
    status: "success",
    code: 200,
    body: data,
  });
};
/*
 belum vaclisasi ini 

 The username does allow capital letters, but when checking for availability, small & big letters should be treated the same: 

    E.g. if '@AliIrawan' already exists, another user cannot choose ‘@aliirawan’
*/
