module.exports = async (userTopicModel, lastReadAt, user_id, topic_id) =>
  await userTopicModel.update(
    { last_read_at: lastReadAt },
    { where: { user_id, topic_id }, raw: true }
  );
