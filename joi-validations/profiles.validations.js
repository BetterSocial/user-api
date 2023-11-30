const {object, string, uuid} = require('./general.validations');

const ProfileValidation = {
  followAnonUser: {
    body: object({
      follow_source: string.required(),
      user_id_followed: uuid.required()
    })
  },
  unfollowAnonUser: {
    body: object({
      follow_source: string.required(),
      user_id_followed: uuid.required()
    })
  }
};

module.exports = {ProfileValidation};
