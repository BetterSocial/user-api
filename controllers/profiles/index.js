const changeRealName = require("./changeRealName");
const getMyProfile = require("./getMyProfile");
const getOtherProfile = require("./getOtherProfile");
const updateBio = require("./updateBio");
const changeImageProfile = require("./changeImageProfile");
const removeImageProfile = require("./removeImageProfile");
const following = require("./following");
const setFollowing = require("./setFollowing");
const unSetFollowing = require("./unSetFollowing");
const getProfileByName = require("./getProfileByName")

module.exports = {
  changeRealName,
  getMyProfile,
  changeImageProfile,
  following,
  setFollowing,
  unSetFollowing,
  removeImageProfile,
  getOtherProfile,
  updateBio,
  getProfileByName
};
