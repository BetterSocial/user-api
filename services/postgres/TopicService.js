
const { Op } = require("sequelize");
const NotFoundError = require("../../exceptions/NotFoundError");


class TopicService {
  constructor(topicModel) {
    this._topic = topicModel;
  }

  async getTopicByName(name) {
    try {
      let result = await this._topic.findOne({
        where: {
          name: {
            [Op.iLike]: `%${name}%`
          }
        },

      })
      if (!result) {
        throw new NotFoundError('Topic not found');
      }
      return result;
    } catch (error) {
      console.log(error);
      throw new NotFoundError('Topic not found');
    }

  }
}

module.exports = TopicService;