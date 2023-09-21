const client = require('./connectionRedis');
module.exports = async (key) => {
  try {
    await client.del(key);
  } catch (error) {
    console.log(error);
    throw new Error('Error get data');
  }
};
