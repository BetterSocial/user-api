const createQueuePostTime = async (req, res) => {
    try {
        const { getToken } = require("../../utils");
        const token = getToken(req);
        if (token == null) {
            return res.status(401).json({
                code: 401,
                message: "Failed auth",
                data: null,
            });
        } else {
            if (req.body.post_id && req.body.view_time) {
                const jwt = require("jsonwebtoken");
                const { v4: uuidv4 } = require('uuid');
                const user_id = jwt.decode(token).user_id;
                const { addForViewPost } = require("../../services/score");
                const moment = require("moment");
                /*
                  @description options bull queue ref https://www.npmjs.com/package/bull
                */
                const options = {
                    jobId: uuidv4(),
                    removeOnComplete: true,
                };
              
                const { post_id, view_time, source } = req.body;
console.log("Source of view:" + source); // TODO
                // send queue for scoring processing on create post
                const scoringProcessData = {
                  feed_id: post_id,
                  user_id: user_id,
                  view_duration: view_time,
                  is_pdp: false, // TODO
                  activity_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
                };
                const resultJob = await addForViewPost(scoringProcessData);

                return res.status(200).json({
                    code: 200,
                    status: `success created queue post time with job id : ${resultJob.id}`,
                    data: scoringProcessData,
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
    createQueuePostTime
}
