var express = require('express');
const TopicPage = require('../controllers/topicPage/TopicPage');
var router = express.Router();

// controller
const { API_PREFIX_V1 } = require('../helpers/constants');

/* GET locations listing. */
API_PREFIX_V1
router.get(`${API_PREFIX_V1}/topic-pages`, new TopicPage().getTopicPageById);

module.exports = router;