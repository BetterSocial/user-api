const stream = require('getstream');

module.exports = async (token, id, query) => {
  const client = stream.connect(process.env.API_KEY, token, process.env.APP_ID);
  const topic = await client.feed('topic', id).get(query);

  return topic;
};
