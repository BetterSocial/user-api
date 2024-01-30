const moment = require('moment');
const deleteActivityFromUserFeed = require('../../services/getstream/deleteActivityFromUserFeed');

const getstreamService = require('../../services/getstream');
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH,
  POST_TYPE_LINK,
  GETSTREAM_RANKING_METHOD
} = require('../../helpers/constants');
const {getListBlockUser, getListBlockPostAnonymousAuthor} = require('../../services/blockUser');
const getBlockDomain = require('../../services/domain/getBlockDomain');
const {
  modifyPollPostObject,
  modifyAnonimityPost,
  isPostBlocked,
  modifyReactionsPost,
  isUserFollowAuthor
} = require('../../utils/post');
const {DomainPage, Locations, User, UserFollowUser} = require('../../databases/models');
const RedisDomainHelper = require('../../services/redis/helper/RedisDomainHelper');
const {ACTIVITY_THRESHOLD} = require('../../config/constant');
const UsersFunction = require('../../databases/functions/users');
const UserFollowUserFunction = require('../../databases/functions/userFollowUser');
const roundingKarmaScore = require('../../helpers/roundingKarmaScore');

const getActivtiesOnFeed = async (feed, token, paramGetFeeds) => {
  console.log('Get activity from getstream => ', feed, paramGetFeeds);
  const response = await getstreamService.getFeeds(token, feed, paramGetFeeds);
  const feeds = response.results;
  return feeds;
};

const feedSwitch = async (feed) => {
  switch (feed) {
    case 'main_feed_following':
      return 'main_feed_f2';
    case 'main_feed_f2':
      return 'main_feed_broad';
    case 'main_feed_broad':
      return 'main_feed';
    default:
      return 'main_feed_following';
  }
};

const isValidActivity = async (item, conditions) => {
  const now = moment().valueOf();
  const dateExpired = moment(item?.expired_at).valueOf();
  const INITIAL_REAL_DATA_DATE = '2023-05-01';
  const isExpired = now > dateExpired && item.duration_feed !== 'never';

  const {listAnonymousAuthor, listBlock, myLocations, listAnonymousPostId, feed, req} = conditions;

  if (item.is_hide) {
    // delete if it's expired or user not the author
    if (item.actor.id !== req.userId) {
      deleteActivityFromUserFeed(feed, req.userId, item.id);
    }
    console.log('Is Hide => ', item.id);
    return false;
  }

  const isBlocked = isPostBlocked(
    item,
    listAnonymousAuthor,
    listBlock,
    myLocations,
    listAnonymousPostId
  );
  if (isBlocked) {
    console.log('Is Blocked => ', item.id);
    return false;
  }

  // skip if activity < May 2023 (2023-05-01)
  const initialRealDataDate = Date.parse(INITIAL_REAL_DATA_DATE);
  if (item.time < initialRealDataDate) {
    console.log(`Created before ${INITIAL_REAL_DATA_DATE} => `, item.time);
    deleteActivityFromUserFeed(feed, req.userId, item.id);
    return false;
  }

  if (isExpired) {
    console.log('Is Expired => ', item.expired_at, item.id);
    deleteActivityFromUserFeed(feed, req.userId, item.id);
    return false;
  }

  // filter by threshold
  const threshold = ACTIVITY_THRESHOLD[feed.toUpperCase()];
  return (item.final_score || 0) >= threshold;
};

const getActorFromLatestReaction = (latestReaction) => {
  let postActors = new Set();
  latestReaction?.upvotes?.forEach((upvote) => postActors.add(upvote.user_id));
  latestReaction?.downvotes?.forEach((downvote) => postActors.add(downvote.user_id));
  latestReaction?.comments?.forEach((comments) => postActors.add(comments.user_id));
  latestReaction?.comment?.forEach((comment) => postActors.add(comment.user_id));
  return Array.from(postActors);
};

const setKarmaScore = (latestReaction, karmaScores) => {
  return latestReaction.map((reaction) => {
    const user = karmaScores.find((user) => user.user_id === reaction.user_id);
    if (reaction.latest_children) {
      reaction.latest_children = addKarmaScoreToLatestReaction(
        reaction.latest_children,
        karmaScores
      );
    }
    return {
      ...reaction,
      karma_score: roundingKarmaScore(user?.karma_score || 0)
    };
  });
};

const addKarmaScoreToLatestReaction = (latestReaction, karmaScores) => {
  if (latestReaction?.upvotes) {
    latestReaction.upvotes = setKarmaScore(latestReaction.upvotes, karmaScores);
  }
  if (latestReaction?.downvotes) {
    latestReaction.downvotes = setKarmaScore(latestReaction.downvotes, karmaScores);
  }
  if (latestReaction?.comments) {
    latestReaction.comments = setKarmaScore(latestReaction.comments, karmaScores);
  }
  if (latestReaction?.comment) {
    latestReaction.comment = setKarmaScore(latestReaction.comment, karmaScores);
  }
  return latestReaction;
};

module.exports = async (req, res) => {
  let {
    offset = 0,
    limit = MAX_DATA_RETURN_LENGTH,
    getstreamLimit = MAX_FEED_FETCH_LIMIT,
    feed = 'main_feed_following'
  } = req.query;

  let getFeedFromGetstreamIteration = 0;
  const data = [];

  try {
    const {token} = req;
    const [
      myAnonymousUser,
      // START get excluded post parameter
      listBlockUser,
      listBlockDomain,
      listPostAnonymousAuthor,
      isBlurredPost,
      allFollowingUser
    ] = await Promise.all([
      UsersFunction.findAnonymousUserId(User, req.userId, {raw: true}),
      getListBlockUser(req.userId),
      getBlockDomain(req.userId),
      getListBlockPostAnonymousAuthor(req.userId),
      UserFollowUserFunction.checkIsBlurredPost(UserFollowUser, req.userId),
      UserFollowUserFunction.getAllFollowingUser(UserFollowUser, req.userId)
    ]);
    let postActors = [];

    const listAnonymousAuthor = listPostAnonymousAuthor.map(
      (value) => value.post_anonymous_author_id
    );

    const listAnonymousPostId = [];

    const listBlock = String(listBlockUser + listBlockDomain);

    const myLocations = [];
    const userLocations = await User.findByPk(req.userId, {
      include: [
        {
          model: Locations,
          as: 'locations',
          through: {attributes: []},
          attributes: ['neighborhood']
        }
      ]
    });

    userLocations?.locations.forEach((loc) => {
      myLocations.push(loc.neighborhood);
    });
    // END get excluded post parameter
    // Get feed from main_feed_following, main_feed_f2, main_feed_topic, main_feed_topic
    while (data.length < limit) {
      if (getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION) break;

      try {
        const paramGetFeeds = {
          limit: getstreamLimit,
          reactions: {own: true, recent: true, counts: true},
          ranking: GETSTREAM_RANKING_METHOD,
          offset
        };

        const feeds = await getActivtiesOnFeed(feed, token, paramGetFeeds);
        if (feeds.length === 0) {
          if (feed === 'main_feed') {
            break;
          } else {
            offset = 0;
            feed = await feedSwitch(feed);
            continue;
          }
        }
        // Change to conventional loop because map cannot handle await
        for (let item of feeds) {
          // validation admin hide post
          const conditions = {
            listAnonymousAuthor,
            listBlock,
            myLocations,
            listAnonymousPostId,
            feed,
            req
          };
          const validActivity = await isValidActivity(item, conditions);
          if (!validActivity) {
            offset++;
            continue;
          } else {
            item.is_self =
              item.actor.id === req.userId || item.actor.id === myAnonymousUser?.user_id;
            // check if actor is already in postActors
            if (!postActors.includes(item.actor.id)) {
              // post actor is a list of user id that already in the feed
              // it will later be used to get their karma score
              postActors.push(item.actor.id);
            }

            if (item.verb === POST_VERB_POLL) {
              const postPoll = await modifyPollPostObject(req.userId, item, isBlurredPost);
              data.push(postPoll);
            } else {
              let newItem = await isUserFollowAuthor(item, allFollowingUser);
              newItem = modifyReactionsPost(newItem, newItem.anonimity);
              if (item.post_type === POST_TYPE_LINK) {
                const domainPageId = item?.og?.domain_page_id;
                if (domainPageId) {
                  const credderScoreCache = await RedisDomainHelper.getDomainCredderScore(
                    domainPageId
                  );
                  if (credderScoreCache) {
                    newItem.credderScore = credderScoreCache;
                    newItem.credderLastChecked =
                      await RedisDomainHelper.getDomainCredderLastChecked(domainPageId);
                  } else {
                    const dataDomain = await DomainPage.findOne({
                      where: {domain_page_id: domainPageId},
                      raw: true
                    });

                    if (dataDomain) {
                      await RedisDomainHelper.setDomainCredderScore(
                        domainPageId,
                        dataDomain?.credder_score
                      );
                      await RedisDomainHelper.setDomainCredderLastChecked(
                        domainPageId,
                        dataDomain?.credder_last_checked
                      );

                      newItem.credderScore = dataDomain?.credder_score;
                      newItem.credderLastChecked = dataDomain?.credder_last_checked;
                    }
                  }
                }
              }
              data.push(newItem);
            }
            offset++;
            // if (Number(data.length) === Number(limit)) break;
          }
        }

        getFeedFromGetstreamIteration++;
      } catch (err) {
        console.log(err);
        return res.status(403).json({
          status: 'failed',
          data: null,
          offset,
          feed,
          error: err
        });
      }
    }
    // get karma score for each post actor
    for (const d of data) {
      const actor_from_reaction = getActorFromLatestReaction(d.latest_reactions);
      postActors = [...postActors, ...actor_from_reaction];
    }

    const karmaScores = await UsersFunction.getUsersKarmaScore(User, postActors);
    for (let i = 0; i < data.length; i++) {
      const user = karmaScores.find((user) => user.user_id === data[i].actor.id);
      data[i].karma_score = roundingKarmaScore(user?.karma_score || 0);

      if (data[i].latest_reactions) {
        data[i].latest_reactions = addKarmaScoreToLatestReaction(
          data[i].latest_reactions,
          karmaScores
        );
      }

      if (data[i].own_reactions) {
        data[i].own_reactions = addKarmaScoreToLatestReaction(data[i].own_reactions, karmaScores);
      }

      data[i] = await modifyAnonimityPost(data[i], isBlurredPost);
    }

    return res.status(200).json({
      code: 200,
      status: 'success',
      data,
      offset,
      feed
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      offset,
      feed,
      message: 'Internal server error',
      error
    });
  }
};
