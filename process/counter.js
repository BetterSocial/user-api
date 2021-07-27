const countProcess = async (post_id, increment, column) => {
    const { PostStatistic } = require("../databases/models");
    const { dateCreted } = require("../utils");
    const findUpCounterUser = await PostStatistic.count({
        where: { post_id }
    });
    /*
      @description if exist vote for spesific post counter else create post counter
    */
    try {
        if (findUpCounterUser) {
            await PostStatistic.increment(
                increment,
                { where: { post_id } }
            );
            await PostStatistic.update(
                { updated_at: new Date().toISOString() },
                { where: { post_id } }
            );
        } else {
            const data = { post_id, ...column, ...dateCreted }
            await PostStatistic.create(data);
        }
        console.info("counter post created");
    } catch (error) {
        console.info(error);
    }
}

module.exports = { countProcess }