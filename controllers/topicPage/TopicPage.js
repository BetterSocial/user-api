const ClientError = require("../../exceptions/ClientError");
const {
  MAX_FEED_FETCH_LIMIT,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  POST_VERB_POLL,
} = require("../../helpers/constants");
const BlockServices = require("../../services/block/BlockServices");
const {
  getListBlockPostAnonymous,
  getListBlockUser,
} = require("../../services/blockUser");
const getBlockDomain = require("../../services/domain/getBlockDomain");
const ConnectGetstream = require("../../services/getstream/ConnectGetstream");
const {
  connectStreamChat,
} = require("../../services/getstream/connectStreamChat");
const GetstreamService = require("../../services/getstream/GetstreamService");
const { modifyPollPostObject } = require("../../utils/post");
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
    let getFeedFromGetstreamIteration = 0;
    let { id } = req.params;
    let { limit = MAX_FEED_FETCH_LIMIT, offset = 0 } = req.query;
    // const client = await connectStreamChat(req.userId, req.token)

    // const channels = await client.queryChannels({ id })
    // const countUnread = await channels[0]?.markRead()
    // const channels = await client.queryChannels({ id: `topic_${id}` })
    // const countUnread = await channels[0]?.markRead()

    try {
      this._validator.validateGetTopicPages({ id });
      const topicPages = await this._getStreamService.getTopicPages(
        id,
        limit,
        offset
      );

      const listBlockUser = await getListBlockUser(req.userId);
      const listBlockDomain = await getBlockDomain(req.userId);
      const listPostAnonymous = await getListBlockPostAnonymous(req.userId);
      let newTopicPagesWithBlock = new BlockServices(
        listBlockUser,
        listBlockDomain,
        listPostAnonymous
      ).getHasBlock(topicPages);
      let data = [];

      for (let index = 0; index < newTopicPagesWithBlock.length; index++) {
        // validation admin hide post

        const item = newTopicPagesWithBlock[index];
        if (item.is_hide) {
          continue;
        }
        if (item.verb === POST_VERB_POLL) {
          let postPoll = await modifyPollPostObject(req.userId, item);
          data.push(postPoll);
        } else {
          data.push(item);
        }
      }
      res.status(200).json({
        code: 200,
        status: "success",
        message: "Success get topic pages",
        data: data || [],
        offset: parseInt(offset) + parseInt(topicPages.length),
      });
    } catch (error) {
      console.log(error);
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          code: error.statusCode,
          status: "fail",
          message: error.message,
          data: [],
          offset: parseInt(offset),
        });
      }

      return res.status(500).json({
        code: error.statusCode,
        status: "error",
        message: "Internal server error",
        data: [],
        offset: parseInt(offset),
      });
    }
  }

  async getTopicPageById(req, res) {
    let { id, id_gte } = req.params;

    try {
      this._validator.validateGetTopicPageByID({ id, id_gte });
      const topicPage = await this._getStreamService.getTopicPageById(
        id,
        id_gte
      );
      // todo mengambil daftar user yang di blok

      res.status(200).json({
        code: 200,
        status: "success",
        message: "Success get topic page",
        data: topicPage,
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return res.status(error.statusCode).json({
          code: error.statusCode,
          status: "fail",
          message: error.message,
          data: "null",
        });
      }

      return res.status(500).json({
        code: error.statusCode,
        status: "error",
        message: "Internal server error",
        data: "null",
      });
    }
  }
}

module.exports = TopicPage;
