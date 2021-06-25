const { PostViewTime } = require("../databases/models");

const addPostTimeJob = async (job, done) => {
    try {
        console.info('add post time job is working! with id ' + job.id);
        /*
          @description job save to table post time
        */
        const result = await PostViewTime.create(job.data);
        console.info(`created ${result}`);
        done(null, result);
    } catch (error) {
        done(null, error);
    }
}

const updatePostTimeJob = async (job, done) => {
    try {
        console.info('updated post time job is working! with id ' + job.id);
        /*
          @description job updated to table post time
        */
        const result = await PostViewTime.update(job.data.body, {
            where: job.data.where
        });
        console.info(`updated ${result}`);
        done(null, result);
    } catch (error) {
        done(null, error);
    }
}

module.exports = {
    addPostTimeJob, updatePostTimeJob
};
