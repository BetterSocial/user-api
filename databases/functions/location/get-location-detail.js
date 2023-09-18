/**
 *
 * @param {Model} locationModel
 * @param {number} locationId
 */
const getLocationDetail = async (locationModel, locationId) => {
  if (locationId === null || locationId == '') return {};

  try {
    return await locationModel.findByPk(locationId);
  } catch (e) {
    console.log(e);
    return {};
  }
};

module.exports = getLocationDetail;
