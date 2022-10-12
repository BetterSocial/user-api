const { Request, Response } = require('express')
const { DomainPage } = require('../../databases/models')
const OpenGraph = require('open-graph')

const __getOpenGraphInfo = (url) => {
    return new Promise((resolve, reject) => {
        OpenGraph(url, (err, meta) => {
            if (err) return reject({
                success: false,
                error: err
            })
            return resolve({
                success: true,
                data: meta
            })
        })
    })
}

/**
 * 
 * @param {Request} req 
 * @param {Response} res 
 * @returns 
 */
const getOpenGraph = async (req, res) => {
    const { url, domain } = req.body

    let openGraphDomain = null

    const singleDomain = await DomainPage.findOne({
        where: { domain_name: domain },
        raw: true
    })

    if (!singleDomain) {
        openGraphDomain = await __getOpenGraphInfo(domain)
        if (!openGraphDomain?.success) return res.status(404).json({
            success: false,
            message: "Get domain info failed"
        })
    }

    let urlOpenGraph = await __getOpenGraphInfo(url)
    if (!urlOpenGraph?.success) {
        return res.status(404).json({
            success: false,
            message: "Get open graph info failed"
        })
    }

    const { title, image, url: link, description } = urlOpenGraph?.data || {}

    return res.status(200).json({
        success: true,
        message: "get open graph success",
        data: {
            domain: {
                name: singleDomain === null ? openGraphDomain?.title : singleDomain?.domain_name,
                image: singleDomain === null ? openGraphDomain?.image : singleDomain?.logo
            },
            meta: {
                title,
                image: image?.url,
                url: link,
                description
            }
        }
    })
}

module.exports = getOpenGraph