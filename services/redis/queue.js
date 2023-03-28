const Bull = require("bull");
const { v4: uuidv4 } = require("uuid");

const { convertingUserFormatForLocation } = require("../../utils/custom");

const connectRedis = process.env.REDIS_TLS_URL ? process.env.REDIS_TLS_URL : process.env.REDIS_URL;

const registerQueue = new Bull("registerQueue", connectRedis,
    {
        redis: {
            tls: { rejectUnauthorized: false, requestCert: true, agent: false, },
            maxRetriesPerRequest: 100,
            connectTimeout: 30000
        }
    }
);

const registerV2Queue = new Bull("registerV2", connectRedis,
    {
        redis: {
            tls: { rejectUnauthorized: false, requestCert: true, agent: false, },
            maxRetriesPerRequest: 100,
            connectTimeout: 30000
        }
    }
);
registerQueue.on('error', (err) => { console.log('posttimeque', /** err **/) });
registerQueue.on('waiting', (e) => { console.log('postime: ', /** e **/) });

const registerServiceQueue = async (token, userId, follows, topics, locations, myAnonUserId) => {
    let locationsChannel = convertingUserFormatForLocation(locations);

    let data = {
        token,
        userId,
        locationsChannel,
        follows,
        topics,
        anonUserId: myAnonUserId,
        locations
    }

    const options = {
        jobId: uuidv4(),
        removeOnComplete: true,
    };

    let status = await registerQueue.add(data, options);
    return status;
}

const registerV2ServiceQueue = async (token, userId, follows, topics, locations, myAnonUserId) => {
    let locationsChannel = convertingUserFormatForLocation(locations);

    let data = {
        token,
        userId,
        locationsChannel,
        follows,
        topics,
        anonUserId: myAnonUserId,
        locations
    }

    const options = {
        jobId: uuidv4(),
        removeOnComplete: true,
    };

    try {
        await registerV2Queue.add(data, options);
    } catch(e) {
        console.log('error', e)
    }
}


module.exports = {
    registerServiceQueue,
    registerV2ServiceQueue,
};
