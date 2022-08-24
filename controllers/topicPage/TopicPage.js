const ClientError = require("../../exceptions/ClientError");
const { MAX_FEED_FETCH_LIMIT } = require("../../helpers/constants");
const BlockServices = require("../../services/block/BlockServices");
const { getListBlockPostAnonymous, getListBlockUser } = require("../../services/blockUser");
const getBlockDomain = require("../../services/domain/getBlockDomain");
const ConnectGetstream = require("../../services/getstream/ConnectGetstream");
const { connectStreamChat } = require("../../services/getstream/connectStreamChat");
const GetstreamService = require("../../services/getstream/GetstreamService");
const TopicPageValidator = require("../../validators/topicPage");

class TopicPage {
  constructor() {
    const client = ConnectGetstream;
    this._getStreamService = new GetstreamService(client);
    this._validator = TopicPageValidator;
    this.getTopicPages = this.getTopicPages.bind(this);
    this.getTopicPageById = this.getTopicPageById.bind(this);

  }

  async getTopicPages(req, res) {
    let { id } = req.params;
    let { limit = MAX_FEED_FETCH_LIMIT, offset = 0 } = req.query
    const client = await connectStreamChat(req.userId, req.token)
    const channel = client.channel('messaging', id)
    channel.updatePartial({set: {unread: 0}})
    
    try {
      this._validator.validateGetTopicPages({ id });
      const topicPages = await this._getStreamService.getTopicPages(id, limit, offset);

      const listBlockUser = await getListBlockUser(req.userId);
      const listBlockDomain = await getBlockDomain(req.userId);
      const listPostAnonymous = await getListBlockPostAnonymous(req.userId);
      let newTopicPagesWithBlock = new BlockServices(listBlockUser, listBlockDomain, listPostAnonymous).getHasBlock(topicPages);
      res.status(200).json({
        code: 200,
        status: 'success',
        message: "Success get topic pages",
        data: newTopicPagesWithBlock || [],
        offset: parseInt(offset) + parseInt(newTopicPagesWithBlock.length)
      })
    } catch (error) {
      console.log(error);
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          "code": error.statusCode,
          "status": 'fail',
          "message": error.message,
          "data": "null",
          offset: parseInt(offset),
        });
      }

      return res.status(500).json({
        "code": error.statusCode,
        "status": 'error',
        "message": 'Internal server error',
        "data": "null",
        offset: parseInt(offset),
      });
    }
  }

  async getTopicPageById(req, res) {
    let { id, id_gte } = req.params;

    try {
      this._validator.validateGetTopicPageByID({ id, id_gte });
      const topicPage = await this._getStreamService.getTopicPageById(id, id_gte);
      // todo mengambil daftar user yang di blok

      res.status(200).json({
        code: 200,
        status: 'success',
        message: "Success get topic page",
        data: topicPage,
      })
    } catch (error) {
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          "code": error.statusCode,
          "status": 'fail',
          "message": error.message,
          "data": "null"
        });
      }

      return res.status(500).json({
        "code": error.statusCode,
        "status": 'error',
        "message": 'Internal server error',
        "data": "null"
      });
    }
  }
}

module.exports = TopicPage;