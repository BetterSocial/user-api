const stream = require("getstream");

module.exports = async (reactionId, token) => {
  try {
    const clientUser = stream.connect(
      process.env.API_KEY,
      token,
      process.env.APP_ID
    );
    return await clientUser.reactions.get(reactionId);
  } catch (e) {
      console.log(e);
      return false;
  }
  // try {
  //   const client = stream.connect(process.env.API_KEY, process.env.SECRET);
  //   let data = [];
  //   data.push(reactionId);
  //   let result = await client.;
  //   console.log(result);
  //   return result;
  // } catch (e) {
  //   console.log(e);
  //   return false;
  // }
};
