const Bull = require("bull")
const Redis = require('ioredis');
const { handlerFailure, handlerCompleted, handlerStalled } = require("./handler")

let client
let subscriber

class BetterSocialQueue {
    /**
     * 
     * @param {String} queueName 
    * @param {Object} additionalQueueOptions 
     * @returns {Bull.Queue}
     */
    static generate(queueName, additionalQueueOptions = {}) {
        // Uncomment below for local development redis
        // let redisUrl = process.env.REDIS_TLS_URL

        // Comment below for heroku redis
        let redisUrl = process.env.REDIS_URL

        let createClientOptions = {
            redis: {
                enableReadyCheck: false,
                maxRetriesPerRequest: null,
                tls: {
                    // rejectUnauthorized: false,
                    // requestCert: true
                }

            },
            createClient: (type, redisOpts) => {
                switch (type) {
                    case 'client':
                        if (!client) {
                            client = new Redis(redisUrl, redisOpts);
                        }
                        return client;
                    case 'subscriber':
                        if (!subscriber) {
                            subscriber = new Redis(redisUrl, redisOpts);
                        }
                        return subscriber;
                    case 'bclient':
                        return new Redis(redisUrl, redisOpts);
                    default:
                        throw new Error('Unexpected connection type: ', type);
                }
            }
        }

        // Uncomment below for local development redis
        // let queueOptions = { ...createClientOptions, ...additionalQueueOptions }

        // Comment below for local heroku redis
        let queueOptions = {
            ...createClientOptions,
            ...additionalQueueOptions
        }

        return new Bull(queueName, redisUrl, queueOptions)
    }

    /**
     * @param {Bull.Queue} queue
     * @param {import("bull").ProcessCallbackFunction} onProcess
     * @param {import("bull").ErrorEventCallback} [onError]
     * @returns {Bull.Queue} 
     */
    static setEventCallback(queue, onProcess, onError) {
        if (!queue) throw new Error(`'queue' param cannot be null`)
        if (!process) throw new Error(`'process' param cannot be null`)

        console.log(`Log ${queue.name} is running`)
        queue.process(onProcess)
        queue.on("failed", handlerFailure);
        queue.on("completed", handlerCompleted);
        queue.on("stalled", handlerStalled);

        if (!onError) queue.on('error', (err) => console.log(`${queue.name} error : ${err}`))
        else queue.on('error', onError)
    }

    /**
     * @param {Bull.Queue} queue
     * @param {String} cron 
     * @returns {Bull.Queue} 
     */
    static setCron(queue, cron) {
        queue.add({}, {
            removeOnFail: true,
            removeOnComplete: true,
            repeat: {
                cron,
            },
        });
    }
}

module.exports = BetterSocialQueue