const { sequelize } = require("../../databases/models")

const getBlockedDomain = async (req, res) => {
    try {
        let domainsBlocked = await sequelize.query(
            `SELECT * FROM public.domain_page A INNER JOIN public.user_blocked_domain B
            ON A.domain_page_id = B.domain_page_id
            WHERE B.user_id_blocker = :userId`,
            {
                replacements : {userId : req.userId},
                raw : true
            }
        )

        return res.status(200).json({
            code: 200,
            data : domainsBlocked[0],
            message: 'Get blocked domain success'
        })
    } catch(e) {
        return res.status(400).json({
            code : 400,
            data : null,
            message : 'Something wrong',
            error : e
        })
    }
}

module.exports = {
    getBlockedDomain
}