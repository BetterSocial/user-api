const ElasticNewsLink = require("../../elasticsearch/repo/newsLink/ElasticNewsLink")
const express = require('express')
const { NewsLink } = require('../../databases/models')

/**
 * 
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @returns 
 */
module.exports = async (req, res) => {
    const { news_link_id } = req.params
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
            .searchLinkContextScreenRelatedArticle(newsLink)

        return res.status(200).json({
            success: false,
            message: "Fetching news link related article success",
            data: relatedNewsLink
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