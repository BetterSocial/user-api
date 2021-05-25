const newsJob = (job) => {
  try {
    console.info('news job is working! with id' + job.id);
    const axios = require('axios');
    const cheerio = require('cheerio');
    axios.get(job.data.body.message).then(resp => {
      const domain_page_id = resp.request.host;
      const $ = cheerio.load(resp.data);
      const title = $("title").text();
      const site_name = $('meta[property="og:site_name"]').attr('content');
      const image = $('meta[property="og:image"]').attr('content');
      const description = $('meta[property="og:description"]').attr('content');
      const url = $('meta[property="og:url"]').attr('content');
      const keywords = $('meta[name="keywords"]').attr('content');
      const author = $('meta[name="author"]').attr('content');

      const data = {
        domain_page_id, title, site_name, image, description, url, keywords, author
      }
      
      return data
    });
  } catch (error) {
    return error;
  }
}

module.exports = {
  newsJob
};
