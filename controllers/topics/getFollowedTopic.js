const { sequelize, Sequelize } = require("../../databases/models")

module.exports = async(req, res) => {
    try {
        let topicsFollowed = await sequelize.query(
            `SELECT * FROM public.topics A 
            INNER JOIN public.user_topics B
            ON A.topic_id = B.topic_id 
            WHERE B.user_id = :userId`,
            {
                replacements : {userId : req.userId},
                raw : true
            }
        )

        return res.status(200).json({
            code: 200,
            data : topicsFollowed[0],
            message: 'Get followed topic success'
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