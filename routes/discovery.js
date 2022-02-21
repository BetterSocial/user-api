var express = require('express');
const DiscoveryController = require('../controllers/discovery');
var Router = express.Router();

const { isAuth } = require('../middlewares/auth');

Router.get('/', isAuth, DiscoveryController.search)

module.exports = Router