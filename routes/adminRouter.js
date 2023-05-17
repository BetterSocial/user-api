const express = require("express");
const router = express.Router();
const bulkPostController = require("../controllers/admin/bulkPost");
const auth = require("../middlewares/auth");
const decryptAnonymousUserId = require("../controllers/admin/decryptAnonymousUserId");

router.post("/bulk-post", auth.isAdminAuth, bulkPostController);
router.post(
  "/decrypt-anonymous-userId",
  auth.isAdminAuth,
  decryptAnonymousUserId
);

module.exports = router;
