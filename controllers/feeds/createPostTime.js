const addQueuePostTime = async (req, res) => {
    try {
        const { getToken, dateCreted } = require("../../utils");
        const token = getToken(req);
        if (token == null) {
            return res.status(401).json({
                code: 401,
                message: "Failed auth",
                data: null,
            });
        } else {
            if (req.body.post_id) {
                const jwt = require("jsonwebtoken");
                const { v4: uuidv4 } = require('uuid');
                const { PostViewTime } = require("../../databases/models")
                const post_id = req.body.post_id;
                const user_id = jwt.decode(token).user_id;
                const start_time = dateCreted.created_at;

                const { addQueuePostTime, updateQueuePostTime } = require('../../services/redis');
                /*
                  @description options bull queue ref https://www.npmjs.com/package/bull
                */
                const options = {
                    jobId: uuidv4(),
                    removeOnComplete: true,
                };
                let status
                let resultJob
                let data
                const checkPostView = await PostViewTime.findOne({
                    where : { post_id, user_id }
                });
                if(checkPostView) {
                    const updated_at = dateCreted.updated_at;
                    const end_time = dateCreted.updated_at;
                    const view_time = new Date(updated_at) - new Date(checkPostView.dataValues.start_time);
                    data = { 
                        body : { end_time, view_time, updated_at },
                        where : { post_id, user_id }
                    };
                    resultJob = await updateQueuePostTime.add(data, options);
                    status = `success created queue post time with job id : ${resultJob.id}`;
                } else {
                    data = {
                        post_id, user_id, start_time, ...dateCreted
                    };
                    resultJob = await addQueuePostTime.add(data, options);
                    status = `success updated queue post time with job id : ${resultJob.id}`;
                }
                return res.status(200).json({
                    code: 200,
                    status,
                    data: data,
                });
            } else {
                return res.status(500).json({
                    code: 500,
                    status: `body is required`,
                    data: null,
                });
            }
        }
    } catch (error) {
        console.info(error);
        return res.status(500).json({
            code: 500,
            data: null,
            message: "Internal server error",
            error: error.toString(),
        });
    }
}

module.exports = {
    addQueuePostTime
}