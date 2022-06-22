var express = require('express');
const DiscoveryController = require('../controllers/discovery');
var Router = express.Router();

const { isAuth } = require('../middlewares/auth');

// Router.get('/', isAuth, DiscoveryController.search)
Router.get('/init/user', isAuth, DiscoveryController.InitDiscoveryUserData)
Router.get('/init/topic', isAuth, DiscoveryController.InitDiscoveryTopicData)
Router.get('/user', isAuth, DiscoveryController.SearchUser)
Router.get('/domain', isAuth, DiscoveryController.SearchDomain)
Router.get('/topic', isAuth, DiscoveryController.SearchTopic)
Router.get('/news', isAuth, DiscoveryController.SearchNews)

module.exports = Router