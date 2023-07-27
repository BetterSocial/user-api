const Validator = require('fastest-validator');
const cloudinary = require('cloudinary');
const moment = require('moment');

const getstreamService = require('../../services/getstream');
const {User, Locations} = require('../../databases/models');
const {sequelize} = require('../../databases/models');
const {POST_TYPE_POLL} = require('../../helpers/constants');
const {addForCreatePost} = require('../../services/score');
const {handleCreatePostTO, filterAllTopics} = require('../../utils/post');

const v = new Validator();

function addDays(theDate, days) {
  return new Date(theDate.getTime() + days * 24 * 60 * 60 * 1000);
}

const getLocationDetail = async (locationId) => {
  try {
    return await Locations.findByPk(locationId);
  } catch (err) {
    console.log(err);
    return null;
  }
};

module.exports = async (req, res) => {
  try {
    const {token} = req;

    if (token == null) {
      return res.status(401).json({
        code: 401,
        message: 'Failed auth',
        data: null
      });
    }

    const schema = {
      // topics: "array|empty:false",
      message: 'string',
      verb: 'string|empty:false',
      feedGroup: 'string|empty:false',
      privacy: 'string|empty:false',
      anonimity: 'boolean|empty:false',
      location: 'string|empty:false',
      // location_id: "string|empty:false",
      duration_feed: 'string|empty:false',
      polls: 'array|empty:false',
      pollsduration: {
        $$type: 'object',
        day: 'number|empty:false',
        hour: 'number|empty:false',
        minute: 'number|empty:false'
      },
      multiplechoice: 'boolean|empty:false'
    };

    const validated = v.validate(req.body, schema);
    if (validated.length) {
      return res.status(403).json({
        message: 'Error validation',
        error: validated
      });
    }

    const {
      message,
      verb,
      feedGroup,
      privacy,
      topics,
      anonimity,
      location,
      location_id,
      duration_feed,
      images_url,
      polls,
      pollsduration,
      multiplechoice
    } = req.body;

    // CHECK EXPIRATION DATE
    const {day, hour, minute} = pollsduration;
    const pollsDurationMoment = moment().add(day, 'days').add(hour, 'hour').add(minute, 'minute');
    const pollsDurationInIso = pollsDurationMoment.toISOString();

    let expiredAt = null;
    let date = new Date();
    if (duration_feed !== 'never') {
      date = addDays(date, duration_feed);
      expiredAt = date.toISOString();

      if (pollsDurationMoment.valueOf() > date.getTime())
        return res.status(403).json({
          message: 'Polling Duration cannot be more than post expiration date',
          success: false
        });
    } else {
      date = addDays(date, 100 * 365);
      expiredAt = date.toISOString();
    }

    // CHECK EXPIRATION DATE (END)

    const currentDate = new Date().toISOString();

    let resUrl = '';
    if (images_url) {
      resUrl = await Promise.all(
        images_url.map(async (url) => {
          try {
            const uploadStr = `data:image/jpeg;base64,${url}`;
            const returnCloudinary = await cloudinary.v2.uploader.upload(uploadStr, {
              overwrite: false,
              invalidate: true
            });
            return returnCloudinary.secret_url;
          } catch (error) {
            console.log('error upload gambar');
            return res.status(500).json({
              code: 500,
              status: 'error',
              message: error
            });
          }
        })
      );
    }

    const post = await sequelize.query(
      `INSERT INTO posts (author_user_id, anonymous, duration, topic_id, post_content, created_at, updated_at)
        VALUES(:authorUserId, :anonymous, :duration, :topicId, :postContent, :createdAt, :updatedAt)
        RETURNING post_id`,
      {
        replacements: {
          authorUserId: req.userId,
          anonymous: anonimity,
          duration: expiredAt,
          topicId: 1,
          postContent: resUrl,
          createdAt: currentDate,
          updatedAt: currentDate
        }
      }
    );

    const postId = post[0][0].post_id;

    const poll = await sequelize.query(
      `INSERT INTO polling 
        (question, post_id, user_id, flg_multiple, created_at, updated_at) 
        VALUES (:question, :post_id, :user_id, :flg_multiple, :created_at, :updated_at)
        RETURNING polling_id`,
      {
        replacements: {
          question: message,
          post_id: postId,
          user_id: req.userId,
          flg_multiple: multiplechoice,
          created_at: currentDate,
          updated_at: currentDate
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    const pollId = poll[0][0].polling_id;

    const pollsOptionUUIDs = [];
    // eslint-disable-next-line no-restricted-syntax
    polls.forEach(async (item, i) => {
      const pollOption = await sequelize.query(
        `INSERT INTO polling_option 
        (polling_id, option, counter, created_at, updated_at)
        VALUES (:pollingId, :option, :counter, :createdAt, :updatedAt)
        RETURNING polling_option_id`,
        {
          replacements: {
            pollingId: pollId,
            option: item.text,
            counter: 0,
            createdAt: new Date(new Date().setSeconds(new Date().getSeconds() + i)).toISOString(),
            updatedAt: new Date(new Date().setSeconds(new Date().getSeconds() + i)).toISOString()
          }
        }
      );

      const pollOptionUUID = pollOption[0][0].polling_option_id;
      pollsOptionUUIDs.push(pollOptionUUID);
    });

    const getUserDetail = async (userId) => {
      try {
        return await User.findByPk(userId);
      } catch (err) {
        console.log(err);
        return {};
      }
    };

    const userDetail = await getUserDetail(req.userId);
    let location_level = '';
    if (location_id) {
      const locationDetail = await getLocationDetail(location_id);
      location_level = locationDetail.location_level;
    }

    const newTopic = filterAllTopics(message, topics);

    const object = {
      verb,
      message,
      // topics: topics,
      topics: newTopic,
      feed_group: feedGroup,
      username: userDetail.username,
      profile_pic_path: userDetail.profile_pic_path,
      real_name: userDetail.real_name
    };

    const TO = handleCreatePostTO(req.userId, req.body);

    const data = {
      verb,
      message,
      // topics: topics,
      topics: newTopic,
      privacy,
      object,
      anonimity,
      location,
      duration_feed,
      images_url: resUrl,
      expired_at: expiredAt,
      count_upvote: 0,
      count_downvote: 0,
      polling_id: pollId,
      polls: pollsOptionUUIDs,
      post_type: POST_TYPE_POLL,
      polls_expired_at: pollsDurationInIso,
      multiplechoice,
      to: TO
    };

    getstreamService
      .createPost(token, feedGroup, data, req.userId)
      .then((result) => {
        // send queue for scoring processing on create post
        const scoringProcessData = {
          feed_id: result.id,
          foreign_id: data.foreign_id,
          time: result.time,
          user_id: req.userId,
          message: data.message,
          topics: data.topics,
          privacy: data.privacy,
          anonimity: data.anonimity,
          location_level,
          duration_feed: data.duration_feed,
          expired_at: moment.utc(data.expired_at).format('YYYY-MM-DD HH:mm:ss'),
          images_url: data.images_url,
          poll_id: data.polling_id,
          created_at: moment.utc(data.time).format('YYYY-MM-DD HH:mm:ss')
        };
        addForCreatePost(scoringProcessData);

        res.status(200).json({
          code: 200,
          status: 'success create post',
          data: null
        });
      })
      .catch((err) => {
        console.error('error', err);
        res.status(403).json({
          code: 403,
          status: 'failed create post',
          data: null
        });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      code: 500,
      data: null,
      message: 'Internal server error',
      error
    });
  }
};
