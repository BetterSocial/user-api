/* eslint-disable jest/no-export */

const createReusableAuthTestSuite = (superTest) => {
  return test('Should return 401 Token Not Provided if not logged in', async () => {
    const superTestResponse = await superTest;
    expect(superTestResponse.statusCode).toBe(401);
    expect(superTestResponse.body).toEqual({
      message: 'Token not provided',
      data: null,
      code: 401
    });
  });
};

module.exports = {
  createReusableAuthTestSuite
};
