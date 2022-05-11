
const {DomainPage} = require("../../databases/models");
const { getDetailFeed } = require("../../services/getstream");

const getDetailDomainHandle = async (req, res) => {
    getDetailFeed(req.token, req.params.domainId).then(async (domain) => {
        let data = domain.results[0]
        let domainCheck = await DomainPage.findOne({
            where: { domain_page_id: data.domain.domain_page_id},
            raw: true
        })
        if(!domainCheck) {
            data.domain.credder_score = null,
            data.domain.credder_score_last_checked = null
        } else {
            data.domain.credder_score = domainCheck.credder_score,
            data.domain.credder_score_last_checked = domainCheck.credder_score_last_checked
        }

        res.status(200).send({
            success: true,
            data: domain.results[0]
        })
    }).catch((e) => {
        res.status(400).send({
            success: false,
            message: String(e)
        })
    })

  
}


module.exports = {
    getDetailDomainHandle
}