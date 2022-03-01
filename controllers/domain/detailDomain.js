
const { getDetailFeed } = require("../../services/getstream");

const getDetailDomainHandle = async (req, res) => {
    getDetailFeed(req.token, req.params.domainId).then((domain) => {
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