const moment = require('moment');
const getstreamService = require('../../services/getstream');
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  GETSTREAM_RANKING_METHOD,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH,
  POST_TYPE_LINK
} = require('../../helpers/constants');
const {getListBlockUser, getListBlockPostAnonymousAuthor} = require('../../services/blockUser');
const getBlockDomain = require('../../services/domain/getBlockDomain');
const {
  modifyPollPostObject,
  modifyAnonimityPost,
  isPostBlocked,
  modifyReactionsPost
} = require('../../utils/post');
const {DomainPage, Locations, User, UserFollowUser} = require('../../databases/models');
const RedisDomainHelper = require('../../services/redis/helper/RedisDomainHelper');
const UserFollowUserFunction = require('../../databases/functions/userFollowUser');

module.exports = async (req, res) => {
  let {
    offset = 0,
    limit = MAX_DATA_RETURN_LENGTH,
    getstreamLimit = MAX_FEED_FETCH_LIMIT
  } = req.query;
  let getFeedFromGetstreamIteration = 0;
  let data = [];

  try {
    const token = req.token;
    const listBlockUser = await getListBlockUser(req.userId);
    const listBlockDomain = await getBlockDomain(req.userId);
    const listPostAnonymousAuthor = await getListBlockPostAnonymousAuthor(req.userId);

    let listAnonymousAuthor = listPostAnonymousAuthor.map((value) => {
      return value.post_anonymous_author_id;
    });

    let listAnonymousPostId = [];

    let listBlock = String(listBlockUser + listBlockDomain);

    let myLocations = [];
    let userLocations = await User.findByPk(req.userId, {
      include: [
        {
          model: Locations,
          as: 'locations',
          through: {attributes: []},
          attributes: ['neighborhood']
        }
      ]
    });
    userLocations.locations.forEach((loc) => {
      myLocations.push(loc.neighborhood);
    });

    while (data.length < limit) {
      if (getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION) break;

      try {
        let paramGetFeeds = {
          limit: getstreamLimit,
          reactions: {own: true, recent: true, counts: true},
          ranking: GETSTREAM_RANKING_METHOD,
          offset
        };

        console.log('get feeds with ' + paramGetFeeds.offset);
        let response = await getstreamService.getFeeds(token, 'main_feed', paramGetFeeds);
        let feeds = response.results;

        // Change to conventional loop because map cannot handle await
        for (let item of feeds) {
          // validation admin hide post
          if (item.is_hide) {
            offset++;
            continue;
          }

          let isBlocked = isPostBlocked(
            item,
            listAnonymousAuthor,
            listBlock,
            myLocations,
            listAnonymousPostId
          );
          if (isBlocked) {
            offset++;
            continue;
          }

          // TODO Should be used for testing in dev only. Remove this when done testing (ask Bastian)
          // Put user post score in score details
          // await putUserPostScore(item, req.userId);

          let now = moment().valueOf();
          let dateExpired = moment(item?.expired_at).valueOf();

          // TODO: PLEASE ENABLE THIS CHECKER AFTER SCORING HAS BEEN FIXED
          if (now < dateExpired || item.duration_feed == 'never') {
            const isBlurredPost = await UserFollowUserFunction.checkIsBlurredPost(
              UserFollowUser,
              req.userId
            );
            let newItem = await modifyAnonimityPost(item, isBlurredPost);
            newItem = modifyReactionsPost(newItem);
            if (item.verb === POST_VERB_POLL) {
              let postPoll = await modifyPollPostObject(req.userId, item);
              data.push(postPoll);
            } else {
              if (item.post_type === POST_TYPE_LINK) {
                let domainPageId = item?.og?.domain_page_id;
                if (domainPageId) {
                  let credderScoreCache = await RedisDomainHelper.getDomainCredderScore(
                    domainPageId
                  );
                  if (credderScoreCache) {
                    newItem.credderScore = credderScoreCache;
                    newItem.credderLastChecked =
                      await RedisDomainHelper.getDomainCredderLastChecked(domainPageId);
                  } else {
                    let dataDomain = await DomainPage.findOne({
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
          }

          offset++;

          if (parseInt(data.length) === parseInt(limit)) break;
        }

        getFeedFromGetstreamIteration++;
      } catch (err) {
        console.log(err);
        return res.status(403).json({
          status: 'failed',
          data: null,
          offset,
          error: err
        });
      }
    }

    return res.status(200).json({
      code: 200,
      status: 'success',
      data: data,
      offset
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      offset,
      message: 'Internal server error',
      error: error
    });
  }
};
