const moment = require('moment');
const getstreamService = require('../../services/getstream');
const {
  POST_VERB_POLL,
  MAX_FEED_FETCH_LIMIT,
  GETSTREAM_RANKING_METHOD,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DATA_RETURN_LENGTH,
  POST_TYPE_LINK,
} = require('../../helpers/constants');
const {
  getListBlockUser,
  getListBlockPostAnonymousAuthor,
} = require('../../services/blockUser');
const getBlockDomain = require('../../services/domain/getBlockDomain');
const {
  modifyPollPostObject,
  modifyAnonimityPost,
  isPostBlocked,
  modifyReactionsPost,
} = require('../../utils/post');
const { DomainPage, Locations, User } = require('../../databases/models');
const RedisDomainHelper = require('../../services/redis/helper/RedisDomainHelper');

const getMainFeedFollowing = async(token, paramGetFeeds) => {
    let response = await getstreamService.getFeeds(
        token,
        'main_feed_following',
        paramGetFeeds
      );
    let feeds = response.results;
    return feeds
}

const getMainFeedF2 = async(token, paramGetFeeds) => {
    let response = await getstreamService.getFeeds(
        token,
        'main_feed_f2',
        paramGetFeeds
      );
    let feeds = response.results;
    return feeds
}

const getMainFeedTopic = async(token, paramGetFeeds) => {
    let response = await getstreamService.getFeeds(
        token,
        'main_feed_topic',
        paramGetFeeds
      );
    let feeds = response.results;
    return feeds
}

const getMainFeedBroad = async(token, paramGetFeeds) => {
    let response = await getstreamService.getFeeds(
        token,
        'main_feed_broad',
        paramGetFeeds
      );
    let feeds = response.results;
    return feeds
}

const getActivtiesOnFeed = async (feed, token, paramGetFeeds) => {
    let feeds = []
    switch(feed) {
        case "main_feed_f2":
            feeds = await getMainFeedF2(token, paramGetFeeds);
            return feeds
        case "main_feed_topic":
            feeds = await getMainFeedTopic(token, paramGetFeeds);
            return feeds
        case "main_feed_broad":
            feeds = await getMainFeedBroad(token, paramGetFeeds);
            return feeds
        default:
            feeds = await getMainFeedFollowing(token, paramGetFeeds);
            return feeds
    }
    
}

const feedSwitch = async (feed) => {
    switch(feed) {
        case "main_feed_following":
            return "main_feed_f2";
        case "main_feed_f2":
            return "main_feed_topic";
        case "main_feed_topic":
            return "main_feed_broad";
        default:
          return "main_feed_following"
    }
}

module.exports = async (req, res) => {
  let {
    offset = 0,
    limit = MAX_DATA_RETURN_LENGTH,
    getstreamLimit = MAX_FEED_FETCH_LIMIT,
    feed = 'main_feed_following'
  } = req.query;

  let domainPageCache = {};
  let getFeedFromGetstreamIteration = 0;
  let data = [];

  try {
    const token = req.token;
    // START get excluded post parameter
    const listBlockUser = await getListBlockUser(req.userId);
    const listBlockDomain = await getBlockDomain(req.userId);
    const listPostAnonymousAuthor = await getListBlockPostAnonymousAuthor(
      req.userId
    );

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
          through: { attributes: [] },
          attributes: ['neighborhood'],
        },
      ],
    });
    userLocations.locations.forEach((loc) => {
      myLocations.push(loc.neighborhood);
    });
    // END get excluded post parameter
    // Get feed from main_feed_following, main_feed_f2, main_feed_topic, main_feed_topic
    
    while (data.length < limit) {
      if (
        getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION
      )
        break;

      try {
        let paramGetFeeds = {
          limit: getstreamLimit,
          reactions: { own: true, recent: true, counts: true },
        //   ranking: GETSTREAM_RANKING_METHOD,
          offset
        };

        const feeds = await getActivtiesOnFeed(feed, token, paramGetFeeds)
        if(feeds.length == 0){
            if (feed=='main_feed_broad'){
              break
            }else{
              offset = 0
              feed = await feedSwitch(feed)
              continue;
            }
        }
        // Change to conventional loop because map cannot handle await
        for (let item of feeds) {
          // validation admin hide post
          if (item.is_hide) {
            console.log("Is Hide => ",item.id)
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
            console.log("Is Blocked => ",item.id)
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
            let newItem = await modifyAnonimityPost(item);
            newItem = modifyReactionsPost(newItem, newItem.anonimity);
            if (item.verb === POST_VERB_POLL) {
              let postPoll = await modifyPollPostObject(req.userId, item);
              data.push(postPoll);
            } else {
              if (item.post_type === POST_TYPE_LINK) {
                let domainPageId = item?.og?.domain_page_id;
                if (domainPageId) {
                  let credderScoreCache =
                    await RedisDomainHelper.getDomainCredderScore(domainPageId);
                  if (credderScoreCache) {
                    newItem.credderScore = credderScoreCache;
                    newItem.credderLastChecked =
                      await RedisDomainHelper.getDomainCredderLastChecked(
                        domainPageId
                      );
                  } else {
                    let dataDomain = await DomainPage.findOne({
                      where: { domain_page_id: domainPageId },
                      raw: true,
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
                      newItem.credderLastChecked =
                        dataDomain?.credder_last_checked;
                    }
                  }
                }
              }
              data.push(newItem);
            }
          }
        //   console.log("DATA => ", data)
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
          feed,
          error: err,
        });
      }
    }

    return res.status(200).json({
      code: 200,
      status: 'success',
      data: data,
      offset,
      feed,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      data: null,
      offset,
      feed,
      message: 'Internal server error',
      error: error,
    });
  }
};
