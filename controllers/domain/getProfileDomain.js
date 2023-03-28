const { profileDomain } = require("../../services/domain");

module.exports = async (req, res) => {
  const result = await profileDomain(req.params.name);
  if (!result) {
    return res.status(404).json({
      code: 404,
      status: "domain not found",
      data: result,
    });
  }
  return res.status(200).json({
    code: 200,
    status: "Success get profile domain",
    data: result,
  });
};
