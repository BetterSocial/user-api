const stream = require("getstream");

module.exports = async (feed, id, query) => {
  const client = stream.connect(
    process.env.API_KEY,
    process.env.SECRET,
    process.env.APP_ID
  );
  const clientFeed = client.feed(feed, id);
  const activities = await clientFeed.get(query);
  return activities;
};
