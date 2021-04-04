const stream = require("getstream");

module.exports = async (activityId, message, token) => {
  const clientUser = stream.connect(
    process.env.API_KEY,
    token,
    process.env.APP_ID
  );
  return await clientUser.reactions.add("comment", activityId, {
    text: message,
  });
};
