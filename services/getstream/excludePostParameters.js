const {
  getListBlockUser,
  getListBlockPostAnonymousAuthor,
} = require("../blockUser");
const getBlockDomain = require("../domain/getBlockDomain");
const { Locations, User } = require("../../databases/models");
// START get excluded post parameter
const getExcludePostParameters = async (userId) => {
  const listBlockUser = await getListBlockUser(userId);
  const listBlockDomain = await getBlockDomain(userId);
  const listPostAnonymousAuthor = await getListBlockPostAnonymousAuthor(userId);

  const listAnonymousAuthor = listPostAnonymousAuthor.map(
    (value) => value.post_anonymous_author_id
  );

  const listAnonymousPostId = [];

  const listBlock = String(listBlockUser + listBlockDomain);

  const myLocations = [];
  const userLocations = await User.findByPk(userId, {
    include: [
      {
        model: Locations,
        as: "locations",
        through: { attributes: [] },
        attributes: ["neighborhood"],
      },
    ],
  });
  userLocations.locations.forEach((loc) => {
    myLocations.push(loc.neighborhood);
  });

  return {
    listAnonymousAuthor,
    listBlock,
    myLocations,
    listAnonymousPostId,
  };
};

// END get excluded post parameter
module.exports = {
  getExcludePostParameters,
};
