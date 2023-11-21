const {Request, Response} = require('express');
const {DomainPage} = require('../../databases/models');
const ogs = require('open-graph-scraper');

const __getOpenGraphInfo = async (url) => {
  const options = {url: url};
  try {
    return await ogs(options)
      .then((data) => {
        const {error, result} = data;
        if (error) {
          return {
            success: false,
            error: error
          };
        }

        return {
          success: true,
          data: result
        };
      })
      .catch((err) => {
        return {
          success: true,
          error: err
        };
      });
  } catch (e) {
    console.log(e);
  }
};

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
const getOpenGraph = async (req, res) => {
  const {url, domain} = req.body;

  let openGraphDomain = null;

  const singleDomain = await DomainPage.findOne({
    where: {domain_name: domain},
    raw: true
  });

  if (!singleDomain) {
    openGraphDomain = await __getOpenGraphInfo(domain);
    if (!openGraphDomain?.success)
      return res.status(404).json({
        success: false,
        message: 'Get domain info failed'
      });
  }

  let urlOpenGraph = await __getOpenGraphInfo(url);
  if (!urlOpenGraph?.success) {
    return res.status(404).json({
      success: false,
      message: 'Get open graph info failed'
    });
  }

  const {ogTitle, ogImage, ogUrl, ogDescription} = urlOpenGraph?.data || {};
  return res.status(200).json({
    success: true,
    message: 'get open graph success',
    data: {
      domain: {
        name: singleDomain === null ? openGraphDomain?.data?.ogTitle : singleDomain?.domain_name,
        image: singleDomain === null ? openGraphDomain?.data?.ogImage : singleDomain?.logo
      },
      meta: {
        title: ogTitle,
        image: ogImage?.[0]?.url,
        url: ogUrl,
        description: ogDescription
      }
    }
  });
};

module.exports = getOpenGraph;
