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

class TopicPage {
  constructor() {
    const client = ConnectGetstream;
    this._getStreamService = new GetstreamService(client);
    this._validator = TopicPageValidator;
    this.getTopicPages = this.getTopicPages.bind(this);
    this.getTopicPageById = this.getTopicPageById.bind(this);
  }

  async getFeedTopicPages(payload) {
    const topicPages = await this._getStreamService.getTopicPages(
      payload.id,
      payload.limit,
      payload.offset
    );
    let newTopicPagesWithBlock = new BlockServices(
      payload.listBlockUser,
      payload.listBlockDomain,
      payload.listPostAnonymous
    ).getHasBlock(topicPages);
    let results = await filterFeeds(payload.userId, newTopicPagesWithBlock, payload.id);
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

  async getTopicPages(req, res) {
    let {id} = req.params;
    let {limit = MAX_FEED_FETCH_LIMIT, offset = 0} = req.query;

    try {
      this._validator.validateGetTopicPages({id});
      const listBlockUser = await getListBlockUser(req.userId);
      const listBlockDomain = await getBlockDomain(req.userId);
      const listPostAnonymous = await getListBlockPostAnonymous(req.userId);

      let data = [];
      let payload = {
        listBlockUser,
        listBlockDomain,
        listPostAnonymous,
        id,
        limit,
        offset,
        userId: req.userId
      };
      let fetch = 0;
      while (data.length < limit && fetch < MAX_FEED_FETCH_LIMIT) {
        if (fetch !== 0) {
          payload.offset = parseInt(payload.offset) + parseInt(limit);
        }
        let newTopicPagesWithBlock = await this.getFeedTopicPages(payload);

        for (let post of newTopicPagesWithBlock) {
          if (post?.is_hide) continue;
          data.push(await this.modifiedFeed(req.userId, post));
        }
        fetch += 1;
      }

      res.status(200).json({
        code: 200,
        status: 'success',
        message: 'Success get topic pages',
        data: data || [],
        offset: parseInt(offset)
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
