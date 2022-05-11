const { User, Topics, UserFollowUser, sequelize, Sequelize, NewsLink, DomainPage } = require('../../databases/models')
const { Op, fn, col, QueryTypes } = require('sequelize')
const _ = require('lodash')
const { getDomain } = require('../../services/getstream')
const { getBlockDomain } = require('../../services/domain')
const { filter } = require('lodash')

/**
 * 
 * @param {import("express").Request} req 
 * @param {import("express").Response} res 
 * @returns 
 */
const Search = async(req, res) => {
    const { q } = req.query
    const userId = req.userId
    if(q.length < 2) return res.status(200).json({
        success: true,
        message: 'Your search characters is too few, please input 3 or more characters for search'
    })

    try {
        const blockDomain = await getBlockDomain(req.userId);
        // const blockDomain = ["f0433444-8459-4b9a-969b-dc13f98580b3"]
        let filteredBlockDomainArray = blockDomain instanceof Array ? blockDomain : JSON.parse(blockDomain)
        console.log(filteredBlockDomainArray)

        let newsLink
        if(filteredBlockDomainArray.length > 0) {
            newsLink = await NewsLink.findAll({
                where: {
                    [Op.or] : [
                        { site_name : { [Op.iLike] : `%${q}%`}},
                        { title : { [Op.iLike] : `%${q}%`}},
                        { description : { [Op.iLike] : `%${q}%`}},
                        { url : { [Op.iLike] : `%${q}%`}},
                    ],
                    domain_page_id: { [Op.notIn] : filteredBlockDomainArray.map((item) => item.domain_page_id)}
                },
                limit: 10,
                order: [
                    ['created_at', 'DESC']
                ],
                include : [
                    {
                        model: DomainPage,
                        as: 'newsLinkDomain',
                        attributes: ['domain_name', 'logo', "credder_score", "credder_last_checked"],
                    }
                ]
            })    
        } else {
            newsLink = await NewsLink.findAll({
                where: {
                    [Op.or] : [
                        { site_name : { [Op.iLike] : `%${q}%`}},
                        { title : { [Op.iLike] : `%${q}%`}},
                        { description : { [Op.iLike] : `%${q}%`}},
                        { url : { [Op.iLike] : `%${q}%`}},
                    ],
                },
                limit: 10,
                order: [
                    ['created_at', 'DESC']
                ],
                include : [
                    {
                        model: DomainPage,
                        as: 'newsLinkDomain',
                        attributes: ['domain_name', 'logo', "credder_score", "credder_last_checked"],
                    }
                ]
            })    
        }

        return res.status(200).json({
            success: true,
            message: `Search ${q}`,
            news : newsLink || []
        })
    }catch(e) {
        console.log('e')
        console.log(e)
        return res.status(200).json({
            success: false,
            message: e,
        })
    }
}

module.exports =  Search