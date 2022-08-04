const esb = require('elastic-builder')
const BetterSocialBaseElasticSearchRepo = require('../BetterSocialBaseElasticSearchRepo')

const INDEX_NAME = 'news_link'

class ElasticNewsLink extends BetterSocialBaseElasticSearchRepo {
    constructor() {
        super(INDEX_NAME)
    }

    async searchLinkContextScreenRelatedArticle(newsLinkReference) {
        let { description, title, createdAt, news_link_id } = newsLinkReference
        const query = `${description} ${title}`

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
                    .function(
                        esb.decayScoreFunction('gauss', 'createdAt')
                            .origin(createdAt)
                            .decay(0.8)
                            .scale('3d')
                    )
            )
            .size(10)
            .from(0)
            .minScore(0)

        return await this.search(requestBody)
    }
}

module.exports = ElasticNewsLink