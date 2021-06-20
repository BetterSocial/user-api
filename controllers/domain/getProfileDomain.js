const { profileDomain } = require("../../services/domain");

module.exports = async (req, res) => {
  const result = await profileDomain(req.params.name);
  return res.status(200).json({
    code: 200,
    status: "Success get profile domain",
    data: result,
  });
};
