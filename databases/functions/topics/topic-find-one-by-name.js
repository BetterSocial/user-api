module.exports = async (model, topicId, transaction = null, options = {raw: true}) => {
  if (!model || !topicId) throw new Error('Missing required parameters');

  console.log('topicId', topicId);

  let returnTopic = await model.findOne(
    {
      where: {
        name: topicId
      },
      ...options
    },
    {transaction}
  );

  return returnTopic;
};
