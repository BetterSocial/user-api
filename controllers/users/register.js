const {
  User,
  UserLocation,
  UserLocationHistory,
  UserTopic,
  UserTopicHistory,
  UserFollowUser,
  UserFollowUserHistory,
  Locations,
  Topics
} = require('../../databases/models');
const sequelize = require('../../databases/models').sequelize;
const cloudinary = require('cloudinary');
const Validator = require('fastest-validator');
const moment = require('moment');
const v = new Validator();
const getstreamService = require('../../services/getstream');
const {createRefreshToken} = require('../../services/jwt');
const {v4: uuidv4} = require('uuid');
const {registerServiceQueue} = require('../../services/redis');

const StreamChat = require('stream-chat').StreamChat;
const {addForCreateAccount} = require('../../services/score');
const {USERS_DEFAULT_IMAGE} = require('../../helpers/constants');
const UsersFunction = require('../../databases/functions/users');

const changeValue = (items) => {
  return items.map((item, index) => {
    let temp = Object.assign({}, item.dataValues);
    if (/\s/.test(temp.name)) {
      return temp.name.split(' ').join('-');
    }
    return temp.name;
  });
};

const getNames = (items) => {
  return items.map((item, index) => {
    let temp = Object.assign({}, item.dataValues);
    return temp.name;
  });
};

const createTokenChat = async (userId) => {
  const serverClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
  return serverClient.createToken(userId);
};

const syncUser = async (userId) => {
  const serverClient = new StreamChat(process.env.API_KEY, process.env.SECRET);
  await serverClient.upsertUsers([
    {
      id: userId,
      role: 'user'
    }
  ]);
};

module.exports = async (req, res) => {
  let returnCloudinary = null;
  let defaultImage = USERS_DEFAULT_IMAGE;
  const schema = {
    users: {
      $$type: 'object|empty:false',
      username: 'string|empty:false',
      human_id: 'string|empty:false',
      country_code: 'string|empty:false',
      real_name: 'string|optional: true',
      profile_pic_path: 'string|base64|optional: true'
    },
    local_community: 'string[]',
    topics: 'string[]|empty:false',
    follows: 'string[]',
    follow_source: 'string|empty:false'
  };
  let {users, local_community, topics, follows, follow_source} = req.body.data;
  const validate = v.validate(req.body.data, schema);
  if (validate.length) {
    return res.status(403).json({
      code: 403,
      status: 'error',
      message: validate
    });
  }

  if (users.profile_pic_path) {
    try {
      const uploadStr = 'data:image/jpeg;base64,' + users.profile_pic_path;
      returnCloudinary = await cloudinary.v2.uploader.upload(uploadStr, {
        overwrite: false,
        invalidate: true
      });
    } catch (error) {
      return res.status(500).json({
        code: 500,
        status: 'error',
        message: error
      });
    }
  }

  try {
    let myTs = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const result = await sequelize.transaction(async (t) => {
      const user = await User.create(
        {
          //   generate UUID
          user_id: uuidv4(),
          human_id: users.human_id,
          country_code: users.country_code.toUpperCase(),
          username: users.username,
          real_name: users.real_name ? users.real_name.toLowerCase() : users.real_name,
          profile_pic_path: users.profile_pic_path ? returnCloudinary.secure_url : defaultImage,
          profile_pic_asset_id: users.profile_pic_path ? returnCloudinary.asset_id : null,
          profile_pic_public_id: users.profile_pic_path ? returnCloudinary.public_id : null,
          created_at: myTs,
          updated_at: myTs,
          last_active_at: myTs,
          status: 'Y'
        },
        {transaction: t}
      );

      // local Comunity
      let local_community_array_return = local_community.map((val, index) => {
        return {
          //   generate UUID
          // user_location_id: uuidv4(),
          // user_location_id: val,
          user_id: user.user_id,
          location_id: val,
          created_at: myTs,
          updated_at: myTs
        };
      });
      let returnUserLocation = await UserLocation.bulkCreate(local_community_array_return, {
        transaction: t,
        returning: true
      });

      if (returnUserLocation.length > 0) {
        let user_location_return = returnUserLocation.map((val) => {
          return {
            //   generate UUID
            // user_location_id: uuidv4(),
            // user_location_id: val.location_id,
            user_id: val.user_id,
            location_id: val.location_id,
            action: 'in',
            created_at: moment.utc().format('YYYY-MM-DD HH:mm:ss')
          };
        });
        await UserLocationHistory.bulkCreate(user_location_return, {
          transaction: t
        });
      }

      // Topics
      let topics_array_return = topics.map((val) => {
        return {
          //   generate UUID
          user_topics_id: uuidv4(),
          user_id: user.user_id,
          topic_id: val,
          created_at: myTs,
          updated_at: myTs
        };
      });

      let returnTopic = await UserTopic.bulkCreate(topics_array_return, {
        transaction: t,
        returning: true
      });

      if (returnTopic.length > 0) {
        let topic_return = returnTopic.map((val) => {
          return {
            user_id: val.user_id,
            topic_id: val.topic_id,
            action: 'in',
            created_at: moment.utc().format('YYYY-MM-DD HH:mm:ss')
          };
        });
        await UserTopicHistory.bulkCreate(topic_return, {
          transaction: t
        });
      }

      // User Follow User
      let follows_array_return = follows.map((val) => {
        return {
          //   generate UUID
          follow_action_id: uuidv4(),
          user_id_follower: user.user_id,
          user_id_followed: val
        };
      });

      let returnUserFollowUser = await UserFollowUser.bulkCreate(follows_array_return, {
        transaction: t,
        returning: true
      });

      if (returnUserFollowUser.length > 0) {
        let user_follow_user_return = returnUserFollowUser.map((val) => {
          return {
            user_id_follower: val.user_id_follower,
            user_id_followed: val.user_id_followed,
            action: 'in',
            source: follow_source
          };
        });
        await UserFollowUserHistory.bulkCreate(user_follow_user_return, {
          transaction: t
        });
      }
      return user;
    });

    let data = {
      human_id: result.human_id,
      username: result.username,
      profile_pic_url: result.profile_pic_path,
      created_at: result.createdAt
    };
    const user_id = result.user_id;
    let userId = user_id.toLowerCase();

    await getstreamService.createUser(data, userId);
    const anonUser = await UsersFunction.findAnonymousUserId(User, user_id);
    const token = await getstreamService.createToken(userId);
    const anonymousToken = await getstreamService.createToken(anonUser.user_id);
    await createTokenChat(userId);
    await syncUser(userId);
    let dataLocations = await Locations.findAll({
      where: {
        location_id: local_community
      }
    })
      .then((list) => {
        return list;
      })
      .catch((error) => {
        return res.status(400).json(error);
      });

    let topicNames;
    let dataTopics = await Topics.findAll({
      where: {
        topic_id: topics
      },
      attributes: ['name']
    })
      .then((result) => {
        topicNames = getNames(result);
        let body = changeValue(result);
        return body;
      })
      .catch((error) => {
        console.log(error);
        return res.status(400).json(error);
      });

    await registerServiceQueue(token, userId, follows, dataTopics, dataLocations);

    const scoringProcessData = {
      user_id: result.user_id,
      register_time: myTs,
      emails: [],
      twitter_acc: '',
      topics: topicNames,
      follow_users: follows
    };
    await addForCreateAccount(scoringProcessData);

    const refresh_token = await createRefreshToken(userId);
    return res.status(200).json({
      status: 'success',
      code: 200,
      data: result,
      token: token,
      anonymousToken: anonymousToken,
      refresh_token: refresh_token
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: 'error',
      code: 500,
      message: error
    });
  }
};
