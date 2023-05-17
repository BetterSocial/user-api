const express = require("express");
const router = express.Router();
const bulkPostController = require("../controllers/admin/bulkPost");
const auth = require("../middlewares/auth");
const decryptAnonymousUserId = require("../controllers/admin/decryptAnonymousUserId");
const postBlockUser = require("../controllers/admin/postBlockUser");

router.post("/bulk-post", auth.isAdminAuth, bulkPostController);
router.post("/post/block/user", auth.isAdminAuth, postBlockUser);

module.exports = router;
