const {User, Locations, sequelize} = require('../../databases/models');

const {checkMoreOrLess} = require('../../helpers/checkMoreOrLess');
const UsersFunction = require('../../databases/functions/users');
const {getDb} = require('../../databases/config/mongodb_conn');
const {DB_COLLECTION_POST_SCORE} = require('../../services/score/constant');

const countAuthorPost = async (authorId, anonAuthorId) => {
  const userIds = [authorId, anonAuthorId];
  const db = await getDb();
  const postsCollection = db.collection(DB_COLLECTION_POST_SCORE);
  const count = await postsCollection.countDocuments({author_id: {$in: userIds}});

  return count;
};

const checkIsKarmaUnlocked = async (userId) => {
  // get anonymous_user_id
  const anonymousUser = await UsersFunction.findAnonymousUserId(User, userId, {raw: true});
  // check whether the user has ever made a post in DB
  const hasPostQuery = `SELECT COUNT(*) as count_post from posts WHERE author_user_id in (:user_id) limit 1`;
  const hasPost = await sequelize.query(hasPostQuery, {
    replacements: {user_id: [userId, anonymousUser?.user_id]}
  });
  const hasPostResult = hasPost?.[0]?.[0]?.count_post;
  let countPostInMongo = await countAuthorPost(userId, anonymousUser?.user_id);

  return parseInt(hasPostResult) + parseInt(countPostInMongo) > 0;
};

const updateKarmaUnlocked = async (userId) => {
  await User.update(
    {is_karma_unlocked: true},
    {
      where: {
        user_id: userId
      }
    }
  );
};

module.exports = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      include: [
        {
          model: Locations,
          as: 'locations'
        }
      ],
      attributes: {
        exclude: ['human_id']
      }
    });
    if (user === null) {
      return res.status(404).json({
        code: 404,
        status: 'error',
        message: 'User not found'
      });
    }
    const copyUser = {...user.dataValues};

    const getFollowerCountQuery = `SELECT COUNT(user_follow_user.user_id_follower) as count_follower from user_follow_user WHERE user_id_followed = :user_id`;
    const getFollowingCountQuery = `SELECT COUNT(A.user_id_followed) as count_following 
                                    from user_follow_user A
                                    INNER JOIN users B ON A.user_id_followed = B.user_id
                                    WHERE A.user_id_follower = :user_id
                                    AND B.is_anonymous = false`;

    const getFollowerCount = await sequelize.query(getFollowerCountQuery, {
      replacements: {user_id: req.userId}
    });

    const getFollowingCount = await sequelize.query(getFollowingCountQuery, {
      replacements: {user_id: req.userId}
    });

    const getFollowerCountResult = getFollowerCount?.[0]?.[0]?.count_follower;
    const getFollowingCountResult = getFollowingCount?.[0]?.[0]?.count_following;

    copyUser.following = parseInt(getFollowingCountResult || 0);
    delete copyUser.follower;

    copyUser.following_symbol = checkMoreOrLess(getFollowingCountResult);
    copyUser.follower_symbol = checkMoreOrLess(getFollowerCountResult);
    if (!copyUser.is_karma_unlocked) {
      // check if karma is still locked
      copyUser.is_karma_unlocked = await checkIsKarmaUnlocked(req.userId);
      if (copyUser.is_karma_unlocked) {
        await updateKarmaUnlocked(req.userId);
      }
    }

    return res.json({
      status: 'success',
      code: 200,
      data: copyUser
    });
  } catch (error) {
    return res.status(500).json({
      code: 500,
      status: 'error',
      message: error
    });
  }
};
