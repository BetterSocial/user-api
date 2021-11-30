
const GetTopicPagesPayloadSchema = {
  id: { type: 'string' }
}

const GetTopicPageByIdPayloadSchema = {
  id: { type: 'string' },
  id_gte: { type: 'string' }
}


module.exports = {
  GetTopicPagesPayloadSchema,
  GetTopicPageByIdPayloadSchema
}