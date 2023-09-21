const express = require('express');
const HomeRouter = express.Router();

const HomeController = require('../controllers/home');

HomeRouter.get('/', HomeController);
HomeRouter.post('/', HomeController);
HomeRouter.put('/', HomeController);
HomeRouter.delete('/', HomeController);

module.exports = HomeRouter;
