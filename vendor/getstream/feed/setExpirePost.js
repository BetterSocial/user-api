const GetstreamSingleton = require('../singleton');

const yesterdayIso = () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  return yesterday.toISOString();
};
module.exports = async (activityId) => {
  try {
    const client = GetstreamSingleton.getInstance();
    client.activityPartialUpdate({
      id: activityId,
      set: {
        expired_at: yesterdayIso()
      }
    });
  } catch (error) {
    throw error;
  }
};
