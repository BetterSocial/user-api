const express = require("express");
const router = express.Router();
const bulkPostController = require("../controllers/admin/bulkPost");
const auth = require("../middlewares/auth");

router.post("/bulk-post", auth.isAdminAuth, bulkPostController);

module.exports = router;
