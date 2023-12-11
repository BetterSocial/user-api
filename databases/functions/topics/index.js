const TopicFunction = {
  findAllByTopicIds: require('./topic-find-all-by-ids'),
  findOneByName: require('./topic-find-one-by-name'),
  getTopicDetailByTopicId: require('./topic-get-topic-detail-by-id')
};

module.exports = TopicFunction;
