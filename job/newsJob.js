const getDomainId = async (resp) => {
  const { v4: uuidv4 } = require('uuid');
  const { DomainPage } = require("../databases/models");
  const getDomain = await DomainPage.findOne({
    where: { domain_name: resp.request.host }
  })
  let domain_page_id
  if (getDomain) {
    domain_page_id = getDomain.dataValues.domain_page_id;
  } else {
    const data = {
      domain_page_id: uuidv4(),
      domain_name: resp.request.host,
      logo: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    const saveDomain = await DomainPage.create(data);
    domain_page_id = saveDomain.dataValues.domain_page_id
  }

  return domain_page_id
}

const newsJob = (job) => {
  try {
    console.info('news job is working! with id' + job.id);
    const axios = require('axios');
    const cheerio = require('cheerio');
    axios.get(job.data.body.message).then(async resp => {
      const domain_page_id = await getDomainId(resp);
      const $ = cheerio.load(resp.data);
      const title = $("title").text();
      const site_name = $('meta[property="og:site_name"]').attr('content') || "";
      const image = $('meta[property="og:image"]').attr('content') || "";
      const description = $('meta[property="og:description"]').attr('content') || "";
      const url = $('meta[property="og:url"]').attr('content') || "";
      const keywords = $('meta[name="keywords"]').attr('content') || "";
      const author = $('meta[name="author"]').attr('content') || "";

      const data = {
        domain_page_id, title, site_name, image, description, url, keywords, author
      }
      console.info(data)
      return data
    });
  } catch (error) {
    return error;
  }
}

module.exports = {
  newsJob
};
