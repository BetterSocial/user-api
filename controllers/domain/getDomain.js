const { getDomain } = require("../../services/getstream");
const {
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DOMAIN_DATA_RETURN_LENGTH,
  GETSTREAM_TIME_RANDOM_RANKING_METHOD
} = require("../../helpers/constants");
const _ = require("lodash");

const { getBlockDomain } = require("../../services/domain");
const { DomainPage } = require("../../databases/models/");
const ElasticNewsLink = require("../../elasticsearch/repo/newsLink/ElasticNewsLink");

const MIN_CREDDER_SCORE = 50
const CREDDER_CHECK_ENABLED = true

const elasticNewsLink = new ElasticNewsLink()

module.exports = async (req, res) => {
  let { offset = 0, limit = MAX_DOMAIN_DATA_RETURN_LENGTH } = req.query

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
          ranking: GETSTREAM_TIME_RANDOM_RANKING_METHOD,
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

          if (item?.domain?.credderScore >= MIN_CREDDER_SCORE || !CREDDER_CHECK_ENABLED) {
            data.push(item)
          }

          const { id, content, content_created_at, domain } = item
          const { description, domain_page_id, news_link_id, news_url, site_name, title } = content
          const { image, name } = domain

          elasticNewsLink.putToIndex({
            id, content_created_at, description, domain_page_id, news_link_id, news_url, site_name, title, image, name
          })

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
