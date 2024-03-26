var express = require('express');
var router = express.Router();
const {validate} = require('../middlewares/joi-validation/validate');
const {WhoToFollowValidation} = require('../joi-validations/who-to-follow.validations');

// controller
const whoToFollowController = require('../controllers/whoToFollow');

/* GET user listing. */
router.get('/list', whoToFollowController.whoToFollow);
router.get('/list_v2', validate(WhoToFollowValidation.list), whoToFollowController.whoToFollowV2);

module.exports = router;
