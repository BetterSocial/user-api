const OneSignal = require('@onesignal/node-onesignal');

/**
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
const subscribeOneSignalTopicTag = async () => {
  const configuration = OneSignal.createConfiguration({
    appKey: ''
  });

  new OneSignal.Client(configuration);
};

module.exports = subscribeOneSignalTopicTag;
