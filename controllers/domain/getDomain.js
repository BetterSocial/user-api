const { getDomain } = require("../../services/getstream");
const {
  MAX_FEED_FETCH_LIMIT_DOMAIN,
  GETSTREAM_RANKING_METHOD,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DOMAIN_DATA_RETURN_LENGTH
} = require("../../helpers/constants");
const _ = require("lodash");

const { getBlockDomain } = require("../../services/domain");
const { DomainPage } = require("../../databases/models/");

module.exports = async (req, res) => {
  let { offset = 0, limit = MAX_DOMAIN_DATA_RETURN_LENGTH, fetch = MAX_FEED_FETCH_LIMIT_DOMAIN } = req.query
  console.log(`offset ${offset} limit ${limit}`)

  let domainPageCache = {}

  let data = []
  let getFeedFromGetstreamIteration = 0;
  try {
    const blockDomain = await getBlockDomain(req.userId);

    while (data.length < limit) {
      if (getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION) break;

      try {
        let query = {
          limit,
          offset,
          ranking: GETSTREAM_RANKING_METHOD,
          reactions: { own: true, recent: true, counts: true },
        };

        const resp = await getDomain(query);
        let feeds = resp.results

        for (let i in feeds) {
          let item = feeds[i];
          if (blockDomain.includes(item.content.domain_page_id)) {
            offset++;
            continue;
          }

          if (domainPageCache[item.content.domain_page_id]) {
            let cache = domainPageCache[item.content.domain_page_id]
            item.domain.credderScore = cache.credder_score
            item.domain.credderLastChecked = cache.credder_last_checked
          } else {
            let dataDomain = await DomainPage.findOne({
              where: { domain_page_id: item.content.domain_page_id },
              raw: true
            })

            if (dataDomain) {
              domainPageCache[item.content.domain_page_id] = dataDomain
              item.domain.credderScore = dataDomain.credder_score
              item.domain.credderLastChecked = dataDomain.credder_last_checked
            }
          }

          // console.log(item)

          data.push(item)
          // const { id, content, content_created_at, domain } = item
          // const { description, domain_page_id, news_link_id, news_url, site_name, title } = content
          // const { image, name } = domain

          // elasticNewsLink.putToIndex({
          //   id, content_created_at, description, domain_page_id, news_link_id, news_url, site_name, title, image, name
          // })

          offset++;
          if (data.length === limit) break
        }

        getFeedFromGetstreamIteration++;

      } catch (error) {
        console.log('error')
        console.log(error)
        return res.status(500).json({
          code: 500,
          data: 'asdads',
          message: error,
          error: error,
          offset,
        });
      }
    }

    console.log(data.length)
    res.status(200).json({
      code: 200,
      status: "success",
      data: data,
      offset,
    });
  } catch (e) {
    return res.status(500).json({
      code: 500,
      data: [],
      message: e,
      error: e,
      offset,
    });
  }
};
