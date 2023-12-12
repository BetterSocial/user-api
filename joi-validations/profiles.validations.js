const Joi = require('joi');
const {object, string, uuid} = require('./general.validations');

const ProfileValidation = {
  followAnonUser: {
    body: object({
      follow_source: string.required(),
      user_id_followed: uuid.when('follow_source', {
        switch: [
          {is: 'post', then: Joi.optional()},
          {is: 'comment', then: Joi.optional()}
        ],
        otherwise: Joi.required()
      }),
      post_id: uuid.when('follow_source', {
        is: 'post',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      comment_id: uuid.when('follow_source', {
        is: 'comment',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  },
  unfollowAnonUser: {
    body: object({
      follow_source: string.required(),
      user_id_followed: uuid.when('follow_source', {
        switch: [
          {is: 'post', then: Joi.optional()},
          {is: 'comment', then: Joi.optional()}
        ],
        otherwise: Joi.required()
      }),
      post_id: uuid.when('follow_source', {
        is: 'post',
        then: Joi.required(),
        otherwise: Joi.optional()
      }),
      comment_id: uuid.when('follow_source', {
        is: 'comment',
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  }
};

module.exports = {ProfileValidation};
