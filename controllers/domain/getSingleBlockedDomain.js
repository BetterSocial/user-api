const { UserBlockedDomain } = require("../../databases/models")

const getSingleBlockedDomain = async (req, res) => {
    try {
        let domainsBlocked = await UserBlockedDomain.findOne({
            where: {user_id_blocker: req.userId, domain_page_id: req.params.domainId}
        })
        
        return res.status(200).json({
            code: 200,
            data : domainsBlocked,
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
    getSingleBlockedDomain
}