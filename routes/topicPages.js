var express = require('express');
const TopicPage = require('../controllers/topicPage/TopicPage');
var router = express.Router();
const cloudinary = require("cloudinary");
const auth = require("../middlewares/auth")

// controller
const { API_PREFIX_V1 } = require('../helpers/constants');

/* GET locations listing. */
router.get(`${API_PREFIX_V1}/topic-pages/:id/:cid`, new TopicPage().getTopicPages);
router.get(`${API_PREFIX_V1}/topic-pages/:id/:id_gte`, new TopicPage().getTopicPageById);

module.exports = router;