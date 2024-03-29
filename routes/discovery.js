const express = require('express');
const DiscoveryController = require('../controllers/discovery');

const Router = express.Router();

const {isAuth} = require('../middlewares/auth');

// Router.get('/', isAuth, DiscoveryController.search)
Router.post('/init/domain', isAuth, DiscoveryController.InitDiscoveryDomainData);
Router.post('/init/user', isAuth, DiscoveryController.InitDiscoveryUserData);
Router.post('/init/topic', isAuth, DiscoveryController.InitDiscoveryTopicData);
Router.get('/user', isAuth, DiscoveryController.SearchUser);
Router.get('/domain', isAuth, DiscoveryController.SearchDomain);
Router.get('/topic', isAuth, DiscoveryController.SearchTopic);
Router.get('/news', isAuth, DiscoveryController.SearchNews);

module.exports = Router;
