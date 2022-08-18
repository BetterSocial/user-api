const { ScoreFunction } = require('elastic-builder')
const esb = require('elastic-builder')
const BetterSocialBaseElasticSearchRepo = require('../BetterSocialBaseElasticSearchRepo')

const INDEX_NAME = 'getstream_news_link'

class ElasticNewsLink extends BetterSocialBaseElasticSearchRepo {
    constructor() {
        super(INDEX_NAME)
    }

    async searchLinkContextScreenRelatedArticle(newsLinkReference, offset = 0, limit = 10) {
        let { description, title, createdAt, news_link_id, domain_page_id } = newsLinkReference
        const query = `${description} ${title}`

        console.log(`domain id ${domain_page_id}`)

        const requestBody = esb
            .requestBodySearch()
            .query(
                esb.functionScoreQuery()
                    .query(
                        esb.boolQuery()
                            .mustNot(esb.matchQuery('news_link_id', news_link_id))
                            .should([
                                esb.matchQuery('description', query),
                                esb.matchQuery('title', query),
                            ])
                    )
                    // .function(
                    //     esb.decayScoreFunction('gauss', 'content_created_at')
                    //         .origin(createdAt)
                    //         .decay(0.8)
                    //         .scale('3d')
                    // )
                    .functions([
                        esb.decayScoreFunction('gauss', 'content_created_at')
                            .origin(createdAt)
                            .decay(0.8)
                            .scale('3d')
                            .weight(5),
                        esb.weightScoreFunction()
                            .filter(
                                esb.boolQuery()
                                    .mustNot(
                                        esb.matchQuery('domain_page_id', domain_page_id)
                                    )
                                    // .boost(3)
                            )
                            .weight(2),
                    ])
                    .scoreMode('multiply')
                    .boostMode('multiply')
            )
            .size(limit)
            .from(offset)
            .minScore(0)

        return await this.search(requestBody)
    }

    async putToIndex(item) {
        return await this.index(item.id, item)
    }
}

module.exports = ElasticNewsLink