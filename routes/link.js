var express = require('express')
const router = express.Router()
const LinkController = require('../controllers/links')

router.get('/:username/:platform', LinkController.UserLink)

module.exports = router