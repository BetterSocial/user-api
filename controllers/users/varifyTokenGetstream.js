module.exports = async (req, res) => {
  try {
    return res.json({
      code: 200,
      data: true,
      message: "",
      token: req.token,
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: false,
      message: "verifikasi token error",
    });
  }
};
