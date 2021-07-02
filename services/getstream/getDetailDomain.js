const stream = require("getstream");

module.exports = async (query) => {
  const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );
  console.log(query);
  const nameFeed = client.feed(query.name, query.idFeed);
  // Add an activity to the feed
  return await nameFeed.get(query);
};
