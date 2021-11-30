const { sequelize, Sequelize } = require("../../databases/models")

module.exports = async(req, res) => {
    try {
        let domainsFollowed = await sequelize.query(
            `SELECT * FROM public.domain_page A INNER JOIN public.user_follow_domain B
            ON A.domain_page_id = B.domain_id_followed 
            WHERE B.user_id_follower = :userId`,
            {
                replacements : {userId : req.userId},
                raw : true
            }
        )

        return res.status(200).json({
            code: 200,
            data : domainsFollowed[0],
            message: 'Get followed domain success'
        })
    } catch(e) {
        console.log(e)
        return res.status(500).json({
            code : 500,
            data : null,
            message : 'Internal server error',
            error : e
        })
    }
}