const stream = require('getstream');

module.exports = async (query) => {
  const client = stream.connect(process.env.API_KEY, process.env.SECRET, process.env.APP_ID);
  const nameFeed = client.feed('domain', 'all');
  // Add an activity to the feed
  return await nameFeed.get(query);
};
