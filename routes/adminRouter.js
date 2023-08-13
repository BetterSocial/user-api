const express = require('express');

const router = express.Router();
const auth = require('../middlewares/auth');
const postBlockUser = require('../controllers/admin/postBlockUser');
const postController = require('../controllers/admin/post');
const {bulkPostController} = require('../controllers/admin/bulkPost');
const decryptAnonymousUserId = require('../controllers/admin/decryptAnonymousUserId');

router.post('/bulk-post', auth.isAdminAuth, bulkPostController);
router.post('/post', auth.isAdminAuth, postController);
router.post('/post/block/user', auth.isAdminAuth, postBlockUser);
router.post('/decrypt-anonymous-user', auth.isAdminAuth, decryptAnonymousUserId);

module.exports = router;
