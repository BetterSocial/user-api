module.exports = {
  responseSuccess: (message, data = null) => {
    return {
      code: 200,
      status: message,
      data: data,
    };
  },

  responseError: (message, data = null, code = 400) => {
    return {
      code: code,
      status: message,
      data: data,
    };
  },
};
