function testIfValidURL(str) {
  const pattern = new RegExp('^https?:\\/\\/' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator

  return !!pattern.test(str);
}

const createQueueNews = async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const { newsQueue } = require('../../queue');
    const options = {
      delay: 60000, // 1 min in ms
      attempts: 2,
      jobId: uuidv4()
    };
    if (req.body.url) {
      if(testIfValidURL(req.body.url)) {
        const getJob = await newsQueue.add({ body: req.body }, options);
        return res.status(200).json({
          code: 200,
          status: `succes create news ${getJob.id}`,
          data: req.body,
        });
      } else {
        throw new Error('url is invalid');
      }
    } else {
      throw new Error('url is required');
    }
  } catch (error) {
    return res.status(500).json({
      code: 500,
      data: null,
      message: "Internal server error",
      error: error.toString(),
    });
  }
}

module.exports = {
  createQueueNews
}
