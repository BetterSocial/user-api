const express = require('express');
const TopicPage = require('../controllers/topicPage/TopicPage');
const router = express.Router();

// controller
const { API_PREFIX_V1 } = require('../helpers/constants');

/* GET locations listing. */
router.get(`${API_PREFIX_V1}/topic-pages/:id`, new TopicPage().getTopicPages);
router.get(`${API_PREFIX_V1}/topic-pages/:id/:id_gte`, new TopicPage().getTopicPageById);

module.exports = router;