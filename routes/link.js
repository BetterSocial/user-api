const express = require('express')
const router = express.Router()
const LinkController = require('../controllers/links')

router.get('/:username', LinkController.UserLink)

module.exports = router