module.exports = {
  responseSuccess: (message, data = null) => {
    return {
      code: 200,
      status: message,
      data: data
    };
  },

  responseError: (message, data = null, code = 400) => {
    return {
      code: code,
      status: message,
      data: data
    };
  },
  ResponseSuccess: (res, message = null, code, data = null) => {
    return res.status(code).json({
      code: code,
      status: true,
      message: message,
      data: data
    });
  },

  ResponseError: (res, message = null, code, data = null) => {
    return res.status(code).json({
      code: code,
      status: false,
      message: message,
      data: data
    });
  }
};
