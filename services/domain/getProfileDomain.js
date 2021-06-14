const { DomainPage } = require("../../databases/models");
module.exports = async (name) => {
  try {
    return await DomainPage.findOne({
      where: {
        domain_name: name,
      },
    });
  } catch (error) {
    throw new Error(error);
  }
};
