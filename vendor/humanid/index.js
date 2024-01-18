const {default: axios} = require('axios');
const Sentry = require('@sentry/node');

const verifyExchangeToken = async (exchangeToken) => {
  try {
    const response = await axios.post(
      process.env.HUMANID_URL + 'server/users/exchange',
      {
        exchangeToken
      },
      {
        headers: {
          ContentType: 'application/json',
          'client-id': process.env.HUMANID_CLIENT_ID,
          'client-secret': process.env.HUMANID_CLIENT_SECRET
        }
      }
    );

    if (response?.data?.success) {
      const data = response.data;
      return data;
    }

    return {
      success: false,
      message: response?.data?.message || 'Error on verifying token'
    };
  } catch (error) {
    console.log('error verifying token to human ID');
    // send error to sentry
    Sentry.captureException('error verifying token to human ID');
    return {
      success: false,
      message: error?.message || 'Error on verifying token to human ID'
    };
  }
};

const HumanIdService = {
  verifyExchangeToken
};

module.exports = HumanIdService;
