const ElasticNewsLink = require("../../elasticsearch/repo/newsLink/ElasticNewsLink")
const express = require('express')
const { NewsLink } = require('../../databases/models')
const { getFeeds } = require("../../services/getstream")

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @returns 
 */
module.exports = async (req, res) => {
    const { news_link_id } = req.params
    const { offset = 0, limit = 10 } = req.query
    if (!news_link_id) return res.status(403).json({
        message: "News ID is not defined",
        success: false
    })

    let newsLink = await NewsLink.findOne({
        where: { news_link_id },
        raw: true
    })

    if(!newsLink) return res.status(403).json({
        message : "News Link not found",
        success: false
    })

    try {
        let relatedNewsLink = await new ElasticNewsLink()
            .searchLinkContextScreenRelatedArticle(newsLink, offset, limit)

        let relatedIds = relatedNewsLink.map((item) => item?.id)
        let feeds = await getFeeds(req.token, '', { "ids" : relatedIds })

        return res.status(200).json({
            success: false,
            message: "Fetching news link related article success",
            data: feeds
            // data: relatedNewsLink
        })
    } catch (e) {
        console.log('error')
        console.log(e)
        return res.status(500).json({
            success: false,
            message: "Failed to fetch news link related article"
        })
    }
}