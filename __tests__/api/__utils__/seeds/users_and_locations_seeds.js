const {UserLocation, Locations} = require('../../../../databases/models');

const generateUserAndLocationsSeeds = async (users = []) => {
  const bulks = [];

  for (let i = 0; i < 10; i++) {
    bulks.push({
      location_id: parseInt(i, 10) + 1,
      zip: `zip_${i}`,
      neighborhood: `neighborhood_${i}`,
      city: `city_${i}`,
      state: `state_${i}`,
      country: `country_${i}`,
      location_level: `location_level_${i}`,
      status: 1,
      slug_name: `slug_name_${i}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      flg_show: 1
    });
  }

  await Locations.bulkCreate(bulks);

  const userLocationBulks = users.map((user, index) => {
    return {
      user_location_id: parseInt(index + 1),
      user_id: user.user_id,
      location_id: bulks[0].location_id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  });

  await UserLocation.bulkCreate(userLocationBulks);
  return {
    locations: bulks,
    userLocations: userLocationBulks
  };
};

module.exports = generateUserAndLocationsSeeds;
