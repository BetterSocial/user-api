const {sequelize} = require('../../databases/models');
const InvariantError = require('../../exceptions/InvariantError');
const {v4: uuidv4} = require('uuid');
const moment = require('moment');

class UserTopicService {
  constructor(UserTopicModel, UserTopicHistoryModel) {
    this._userTopicModel = UserTopicModel;
    this._userTopicHistoryModel = UserTopicHistoryModel;
    this.followTopic = this.followTopic.bind(this);
    this.getUserTopic = this.getUserTopic.bind(this);
    this.getFollowTopicStatus = this.getFollowTopicStatus.bind(this);
  }

  async getFollowTopicStatus(user_id, topic_id) {
    try {
      let topicUser = await this.getUserTopic(user_id, topic_id);
      if (topicUser) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
      throw new InvariantError('error get follow topic status');
    }
  }

  async followTopic(user_id, topic_id) {
    try {
      await this.addUserTopic(user_id, topic_id);
      return false;
    } catch (error) {
      console.log(error);
      throw new InvariantError('error follow topic');
    }
  }

  async unfollowTopic(user_id, topic_id) {
    try {
      await this.deleteUserTopic(user_id, topic_id);
      return true;
    } catch (error) {
      console.log(error);
      throw new InvariantError('error unfollow topic');
    }
  }

  async getUserTopic(user_id, topic_id) {
    console.log('getUserTopic');
    let result = await this._userTopicModel.findOne({
      where: {
        user_id: user_id,
        topic_id: topic_id
      }
    });
    return result;
  }

  async deleteUserTopic(user_id, topic_id) {
    try {
      let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      const result = await sequelize.transaction(async (_t) => {
        await this._userTopicModel.destroy({
          where: {
            user_id,
            topic_id
          }
        });
        let userTopicHistory = {
          user_id: user_id,
          topic_id: topic_id,
          action: 'out',
          created_at: date
        };
        await this._userTopicHistoryModel.create(userTopicHistory);
      });
      return result;
    } catch (error) {
      console.log(error);
      throw new InvariantError('failed delete user topic');
    }
  }

  async addUserTopic(user_id, topic_id) {
    try {
      let date = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
      await sequelize.transaction(async (_t) => {
        let userTopic = {
          user_topics_id: uuidv4(),
          user_id: user_id,
          topic_id: topic_id,
          created_at: date,
          updated_at: date
        };

        await this._userTopicModel.create(userTopic);

        let userTopicHistory = {
          user_id: user_id,
          topic_id: topic_id,
          action: 'in',
          created_at: date
        };
        await this._userTopicHistoryModel.create(userTopicHistory);
      });
    } catch (error) {
      console.log(error);
      throw new InvariantError('failed add new user topic');
    }
  }
}

module.exports = UserTopicService;
