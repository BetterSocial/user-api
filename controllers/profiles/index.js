const changeImageProfile = require('./changeImageProfile');
const changeRealName = require('./changeRealName');
const following = require('./following');
const getMyProfile = require('./getMyProfile');
const getOtherFeedsInProfile = require('./getOtherFeedsInProfile');
const getOtherProfile = require('./getOtherProfile');
const getOtherProfilebyUsername = require('./getOtherProfileByUsername');
const getProfileByName = require('./getProfileByName');
const getSelfFeedsInProfile = require('./getSelfFeedsInProfile');
const getSelfAnonymousFeedsInProfile = require('./getSelfAnonymousFeedsInProfile');
const removeImageProfile = require('./removeImageProfile');
const setFollowing = require('./setFollowing');
const unSetFollowing = require('./unSetFollowing');
const updateBio = require('./updateBio');
const { handleBlock } = require('./blocking');
const { anonDmPrivacySettings } = require('./anonDmPrivacySettings');
const followUserV2 = require('./followUsersV2');
const unfollowUserV2 = require('./unfollowUsersV2');

module.exports = {
  changeImageProfile,
  changeRealName,
  following,
  getMyProfile,
  getOtherFeedsInProfile,
  getOtherProfile,
  getOtherProfilebyUsername,
  getProfileByName,
  getSelfFeedsInProfile,
  getSelfAnonymousFeedsInProfile,
  removeImageProfile,
  setFollowing,
  unSetFollowing,
  updateBio,
  handleBlock,
  anonDmPrivacySettings,
  followUserV2,
  unfollowUserV2,
};
