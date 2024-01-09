const ClientError = require('../../exceptions/ClientError');
const {MAX_FEED_FETCH_LIMIT, POST_VERB_POLL} = require('../../helpers/constants');
const BlockServices = require('../../services/block/BlockServices');
const {getListBlockPostAnonymous, getListBlockUser} = require('../../services/blockUser');
const getBlockDomain = require('../../services/domain/getBlockDomain');
const ConnectGetstream = require('../../services/getstream/ConnectGetstream');
const GetstreamService = require('../../services/getstream/GetstreamService');
const {filterFeeds} = require('../../utils/post');
const {modifyPollPostObject} = require('../../utils/post');
const TopicPageValidator = require('../../validators/topicPage');
const {ACTIVITY_THRESHOLD} = require('../../config/constant');
const UsersFunction = require('../../databases/functions/users');
const {User, UserFollowUser} = require('../../databases/models');
const UserFollowUserFunction = require('../../databases/functions/userFollowUser');

class TopicPage {
  constructor() {
    const client = ConnectGetstream;
    this._getStreamService = new GetstreamService(client);
    this._validator = TopicPageValidator;
    this.getTopicPages = this.getTopicPages.bind(this);
    this.getTopicPageById = this.getTopicPageById.bind(this);
  }

  async getFeedTopicPages(payload) {
    let results = {
      noActivity: false,
      data: []
    };
    const topicPages = await this._getStreamService.getTopicPages(
      payload.id,
      payload.limit,
      payload.offset
    );
    if (!topicPages.length) {
      results.noActivity = true;
      return results;
    }
    let newTopicPagesWithBlock = new BlockServices(
      payload.listBlockUser,
      payload.listBlockDomain,
      payload.listPostAnonymous
    ).getHasBlock(topicPages);

    let allFollowingUser = await UserFollowUserFunction.getAllFollowingUser(
      UserFollowUser,
      payload.userId
    );

    const threshold = ACTIVITY_THRESHOLD.TOPIC_FEED;
    results.data = await filterFeeds(
      payload.userId,
      payload.anonymousUserId,
      newTopicPagesWithBlock,
      payload.id,
      threshold,
      payload.isBlurredPost,
      allFollowingUser
    );
    return results;
  }

  async modifiedFeed(userId, post) {
    if (post.verb === POST_VERB_POLL) {
      let postPoll = await modifyPollPostObject(userId, post);
      return postPoll;
    } else {
      return post;
    }
  }

  async getValidActivity(userId, payload, limit) {
    let fetch = 0;
    let results = {
      noActivity: false,
      data: []
    };
    while (results.data.length < limit && fetch < MAX_FEED_FETCH_LIMIT) {
      if (fetch !== 0) {
        payload.offset = parseInt(payload.offset) + parseInt(limit);
      }
      let feeds = await this.getFeedTopicPages(payload);
      if (feeds.noActivity) {
        results.noActivity = true;
        break;
      }
      let newTopicPagesWithBlock = feeds.data;
      if (!newTopicPagesWithBlock.length) break;

      for (let post of newTopicPagesWithBlock) {
        if (post?.is_hide) continue;
        results.data.push(await this.modifiedFeed(userId, post));
      }
      fetch += 1;
    }

    return results;
  }

  async getTopicPages(req, res) {
    let {id} = req.params;
    let {limit = MAX_FEED_FETCH_LIMIT, offset = 0} = req.query;

    try {
      this._validator.validateGetTopicPages({id});

      const [listBlockUser, listBlockDomain, listPostAnonymous, myAnonymousUser, isBlurredPost] =
        await Promise.all([
          getListBlockUser(req.userId),
          getBlockDomain(req.userId),
          getListBlockPostAnonymous(req.userId),
          UsersFunction.findAnonymousUserId(User, req.userId, {
            raw: true
          }),
          UserFollowUserFunction.checkIsBlurredPost(UserFollowUser, req.userId)
        ]);

      let payload = {
        listBlockUser,
        listBlockDomain,
        listPostAnonymous,
        id,
        limit,
        offset,
        userId: req.userId,
        anonymousUserId: myAnonymousUser?.user_id,
        isBlurredPost
      };

      let feeds = await this.getValidActivity(req.userId, payload, limit);

      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Success get topic pages',
        data: feeds.data || [],
        offset: feeds.noActivity
          ? parseInt(payload.offset)
          : parseInt(payload.offset) + parseInt(limit)
      });
    } catch (error) {
      console.log(error);
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          code: error.statusCode,
          status: 'fail',
          message: error.message,
          data: [],
          offset: parseInt(offset)
        });
      }

      return res.status(500).json({
        code: error.statusCode,
        status: 'error',
        message: 'Internal server error',
        data: [],
        offset: parseInt(offset)
      });
    }
  }

  async getTopicPageById(req, res) {
    let {id, id_gte} = req.params;

    try {
      this._validator.validateGetTopicPageByID({id, id_gte});
      const topicPage = await this._getStreamService.getTopicPageById(id, id_gte);
      // todo mengambil daftar user yang di blok

      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Success get topic page',
        data: topicPage
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          code: error.statusCode,
          status: 'fail',
          message: error.message,
          data: 'null'
        });
      }

      return res.status(500).json({
        code: error.statusCode,
        status: 'error',
        message: 'Internal server error',
        data: 'null'
      });
    }
  }
}

module.exports = TopicPage;
