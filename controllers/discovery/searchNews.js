const {Op} = require('sequelize');
const {NewsLink, DomainPage} = require('../../databases/models');

const {getBlockDomain} = require('../../services/domain');
const {CREDDER_MIN_SCORE} = require('../../helpers/constants');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @returns
 */
const Search = async (req, res) => {
  const {q} = req.query;

  try {
    const blockDomain = await getBlockDomain(req.userId);
    const filteredBlockDomainArray =
      blockDomain instanceof Array ? blockDomain : JSON.parse(blockDomain);

    let newsLink;
    if (filteredBlockDomainArray.length > 0) {
      newsLink = await NewsLink.findAll({
        where: {
          [Op.or]: [
            {site_name: {[Op.iLike]: `%${q}%`}},
            {title: {[Op.iLike]: `%${q}%`}},
            {description: {[Op.iLike]: `%${q}%`}},
            {url: {[Op.iLike]: `%${q}%`}}
          ],
          domain_page_id: {[Op.notIn]: filteredBlockDomainArray.map((item) => item.domain_page_id)}
        },
        limit: 50,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: DomainPage,
            as: 'newsLinkDomain',
            attributes: ['domain_name', 'logo', 'credder_score', 'credder_last_checked'],
            where: {
              credder_score: {[Op.gte]: CREDDER_MIN_SCORE},
              status: true
            }
          }
        ]
      });
    } else {
      newsLink = await NewsLink.findAll({
        where: {
          [Op.or]: [
            {site_name: {[Op.iLike]: `%${q}%`}},
            {title: {[Op.iLike]: `%${q}%`}},
            {description: {[Op.iLike]: `%${q}%`}},
            {url: {[Op.iLike]: `%${q}%`}}
          ]
        },
        limit: 50,
        order: [['created_at', 'DESC']],
        include: [
          {
            model: DomainPage,
            as: 'newsLinkDomain',
            attributes: ['domain_name', 'logo', 'credder_score', 'credder_last_checked'],
            where: {
              credder_score: {[Op.gte]: CREDDER_MIN_SCORE},
              status: true
            }
          }
        ]
      });
    }

    return res.status(200).json({
      success: true,
      message: `Search ${q}`,
      news: newsLink || []
    });
  } catch (e) {
    console.log('e');
    console.log(e);
    return res.status(200).json({
      success: false,
      message: e
    });
  }
};

module.exports = Search;
