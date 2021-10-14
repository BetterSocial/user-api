const { getValue, setValue, delCache } = require("../redis");
const { UserBlockedDomain } = require("../../databases/models");
const { BLOCK_DOMAIN_KEY } = require("../../helpers/constants");
const { getIdBlockDomain } = require("../../utils/block");

module.exports = async (userId) => {
  const MY_KEY = getIdBlockDomain(userId);
  const cache = await getValue(MY_KEY);
  if (cache) {
    console.log("domain block dari cache");
    return cache;
  }
  const domainBlock = await UserBlockedDomain.findAll({
    attributes: ["domain_page_id"],
    where: {
      user_id_blocker: userID,
    },
  });
  const valueString = JSON.stringify(domainBlock);
  setValue(MY_KEY, valueString);
  return valueString;
};
