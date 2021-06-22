const upVotedProcess = async (post_id, token) => {
    const { PostUpVoted } = require("../databases/models");
    const jwt = require("jsonwebtoken");
    const { dateCreted } = require("../utils");
    const user_id = await jwt.decode(token).user_id;
    const findUpVoteUser = await PostUpVoted.count({
        where: { post_id, user_id }
    });
    /*
      @description if exist vote for spesific post counter else creatae post counter
    */
    try {
        if (findUpVoteUser) {
            await PostUpVoted.increment(
                { counter: +1 },
                { where: { post_id, user_id } }
            );
        } else {
            const data = { user_id, post_id, counter:1, ...dateCreted }
            await PostUpVoted.create(data);
        }
        console.info("counter created");
    } catch (error) {
        console.info(error);
    }
}

module.exports = { upVotedProcess }