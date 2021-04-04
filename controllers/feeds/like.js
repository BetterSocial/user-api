const { like } = require("../../services/getstream");
module.exports = async (req, res) => {
  try {
    let { activity_id, message } = req.body;

    let result = await like(activity_id, req.token);
    return res.status(200).json({
      code: 200,
      status: "Success like",
      data: result,
    });
  } catch (err) {
    let { status_code, detail, exception_fields } = err.response.data;
    return res.status(status_code).json({
      code: status_code,
      status: detail,
      data: exception_fields,
    });
  }
};
