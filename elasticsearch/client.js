require('dotenv').config()
const elasticsearch = require('elasticsearch')
const BetterSocialElasticSearchBaseRepo = require('./repo/BetterSocialBaseElasticSearchRepo')
const esb = require('elastic-builder')
const { reject } = require('lodash')

class BetterSocialElasticSearch {
    /**
     * @type {elasticsearch.Client}
     */
    static client = null

    /**
     * 
     * @returns {elasticsearch.Client}
     */
    static getClient() {
        if (!this.client) {
            this.client = new elasticsearch.Client({
                host: process.env.SEARCHBOX_SSL_URL
            })
        }

        return this.client
    }

    /**
     * 
     * @param {BetterSocialElasticSearchBaseRepo} betterSocialRepo 
     * @param {esb.RequestBodySearch} body
     */
    static search(betterSocialRepo, body) {
        const client = this.getClient()
        return new Promise((resolve, reject) => {
            client.search({
                index: betterSocialRepo.getIndexName(),
                body: body.toJSON()
            }, (err, response) => {
                const data = response?.hits?.hits?.reduce((acc, next) => {
                    acc.push(next._source)
                    return acc
                }, [])

                resolve(data)
            })
        })
    }
}

module.exports = BetterSocialElasticSearch