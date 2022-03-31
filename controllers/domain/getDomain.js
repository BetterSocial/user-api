const { getDomain } = require("../../services/getstream");
const { 
  MAX_FEED_FETCH_LIMIT_DOMAIN, 
  GETSTREAM_RANKING_METHOD,
  MAX_GET_FEED_FROM_GETSTREAM_ITERATION,
  MAX_DOMAIN_DATA_RETURN_LENGTH
} = require("../../helpers/constants");
const _ = require("lodash");
const { getBlockDomain } = require("../../services/domain");

module.exports = async (req, res) => {
  let { offset = 0, limit = MAX_FEED_FETCH_LIMIT_DOMAIN } = req.query
  console.log(`offset ${offset} limit ${limit}`)

  let data = []
  let getFeedFromGetstreamIteration = 0;
  try {
    const blockDomain = await getBlockDomain(req.userId);

    while(data.length < MAX_DOMAIN_DATA_RETURN_LENGTH) {
      if(getFeedFromGetstreamIteration === MAX_GET_FEED_FROM_GETSTREAM_ITERATION) break;
  
      try {
        let query = {
          limit,
          offset,
          ranking: GETSTREAM_RANKING_METHOD,
          reactions: { own: true, recent: true, counts: true },
        };
  
        console.log(`get feeds from ${query.offset}`)
        const resp = await getDomain(query);
        let feeds = resp.results
  
        for(let i in feeds) {
          let item = feeds[i];
          console.log(`${blockDomain} vs ${item.content.domain_page_id}`)
          if(blockDomain.includes(item.content.domain_page_id)) {
            offset++;
            continue;
          }
  
          data.push(item)
          offset++;
  
          if(data.length === MAX_DOMAIN_DATA_RETURN_LENGTH) break
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
  } catch(e) {
    return res.status(500).json({
      code: 500,
      data: [],
      message: e,
      error: e,
      offset,
    });
  }
};
