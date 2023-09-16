const moment = require("moment");
const { POST_VERB_POLL, POST_TYPE_LINK } = require("../../helpers/constants");
const {
  modifyPollPostObject,
  isPostBlocked,
  modifyReactionsPost,
} = require("../../utils/post");
const { DomainPage } = require("../../databases/models");
const RedisDomainHelper = require("../redis/helper/RedisDomainHelper");

const activityFormatter = async (
  item,
  feedGroup,
  userId,
  excludedPostParameter
) => {
  const { listAnonymousAuthor, listBlock, myLocations, listAnonymousPostId } =
    excludedPostParameter;
  // validation admin hide post
  item.show_to_user = true;
  item.unshow_reason = "";
  item.source_feed = feedGroup;

  if (item.is_hide) {
    console.log("Is Hide => ", item.id);
    item.show_to_user = false;
    item.unshow_reason = "post is hide";
  }

  const isBlocked = isPostBlocked(
    item,
    listAnonymousAuthor,
    listBlock,
    myLocations,
    listAnonymousPostId
  );
  if (isBlocked) {
    console.log("Is Blocked => ", item.id);
    item.show_to_user = false;
    item.unshow_reason = "post is blocked";
  }

  if (item.time < Date.parse("2023-05-01")) {
    console.log("Created before 01 May 2023 => ", item.time);
    item.show_to_user = false;
    item.unshow_reason = "Created before 01 May 2023";
  }

  // TODO Should be used for testing in dev only. Remove this when done testing (ask Bastian)
  // Put user post score in score details
  // await putUserPostScore(item, req.userId);

  const now = moment().valueOf();
  const dateExpired = moment(item?.expired_at).valueOf();
  if (now > dateExpired) {
    console.log("Is Expired => ", item.id);
    item.show_to_user = false;
    item.unshow_reason = "post is hide";
  }

  let newItem = item;
  newItem = modifyReactionsPost(newItem, newItem.anonimity);
  if (item.verb === POST_VERB_POLL) {
    const postPoll = await modifyPollPostObject(userId, item);
    return postPoll;
  }
  if (item.post_type === POST_TYPE_LINK) {
    const domainPageId = item?.og?.domain_page_id;
    if (domainPageId) {
      const credderScoreCache = await RedisDomainHelper.getDomainCredderScore(
        domainPageId
      );
      if (credderScoreCache) {
        newItem.credderScore = credderScoreCache;
        newItem.credderLastChecked =
          await RedisDomainHelper.getDomainCredderLastChecked(domainPageId);
      } else {
        const dataDomain = await DomainPage.findOne({
          where: { domain_page_id: domainPageId },
          raw: true,
        });

        if (dataDomain) {
          await RedisDomainHelper.setDomainCredderScore(
            domainPageId,
            dataDomain?.credder_score
          );
          await RedisDomainHelper.setDomainCredderLastChecked(
            domainPageId,
            dataDomain?.credder_last_checked
          );

          newItem.credderScore = dataDomain?.credder_score;
          newItem.credderLastChecked = dataDomain?.credder_last_checked;
        }
      }
    }
  }
  return newItem;
};

module.exports = {
  activityFormatter,
};
