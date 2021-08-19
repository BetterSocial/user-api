const { getValue, setValue } = require("../redis");
const { UserBlockedDomain } = require("../../databases/models");
const { BLOCK_DOMAIN_KEY } = require("../../helpers/constants");

module.exports = async (userID) => {
  const MY_KEY = BLOCK_DOMAIN_KEY + userID;
  // const cache = await getValue(MY_KEY);
  // if (cache) {
  //   return cache;
  // }
  const domainBlock = await UserBlockedDomain.findAll({
    attributes: ["domain_page_id"],
    where: {
      user_id_blocker: userID,
    },
  });
  const valueString = JSON.stringify(domainBlock);
  // setValue(MY_KEY, valueString);
  return valueString;
};
