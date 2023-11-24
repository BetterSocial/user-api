const Environment = {
  GETSTREAM_API_KEY: process.env.API_KEY,
  GETSTREAM_API_SECRET: process.env.SECRET,
  TENOR_V2_API_KEY: process.env.TENOR_V2_API_KEY,
  TENOR_V2_BASE_URL: process.env.TENOR_V2_BASE_URL,

  // FEATURE FLAGS
  FEAT_SEND_ADD_GROUP_SYSTEM_MESSAGE: true
};

module.exports = Environment;
