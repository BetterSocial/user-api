const stream = require('getstream');
const moment = require('moment');
const client = stream.connect(process.env.API_KEY, process.env.SECRET);
module.exports = async (userId) => {
  let id = userId.toLowerCase();
  const DAYS_IN_SECONDS = 24 * 60 * 60;
  let exp = Math.floor(Date.now() / 1000) + 30 * DAYS_IN_SECONDS;
  return client.createUserToken(id, {exp: exp});
};
