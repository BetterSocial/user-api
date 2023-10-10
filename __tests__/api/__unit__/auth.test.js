const {createUser} = require('../__setups__/utils');

const mockUpdateLastActiveAt = jest.fn();
jest.mock('../../../databases/functions/users', () => ({
  ...jest.requireActual('../../../databases/functions/users'),
  updateLastActiveAt: mockUpdateLastActiveAt
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('UNIT auth middleware', () => {
  it('TESTING isAuth: should call next() if req.user is truthy', async () => {
    await createUser();
    const auth = require('../../../middlewares/auth');
    let req = {
      headers: {
        authorization: 'Bearer token'
      }
    };
    const res = {
      status: () => ({
        json: jest.fn()
      })
    };
    const next = jest.fn();
    await auth.isAuth(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(mockUpdateLastActiveAt).toHaveBeenCalled();
    expect(req).toHaveProperty('user');
    expect(req).toHaveProperty('userId');
    expect(req).toHaveProperty('token');
    expect(req.token).toEqual('token');
  });

  it('TESTING isAuth: should call UsersFunction.updateLastActiveAt()', async () => {
    await createUser();
    const auth = require('../../../middlewares/auth');
    let req = {
      headers: {
        authorization: 'Bearer token'
      }
    };
    const res = {
      status: () => ({
        json: jest.fn()
      })
    };
    const next = jest.fn();
    await auth.isAuth(req, res, next);
    expect(mockUpdateLastActiveAt).toHaveBeenCalled();
  });

  it('TESTING isAuthV2: should call next() if req.user is truthy', async () => {
    await createUser();
    const auth = require('../../../middlewares/auth');
    let req = {
      headers: {
        authorization: 'Bearer token'
      }
    };
    const res = {
      status: () => ({
        json: jest.fn()
      })
    };
    const next = jest.fn();
    await auth.isAuthV2(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(mockUpdateLastActiveAt).toHaveBeenCalled();
    expect(req).toHaveProperty('user');
    expect(req).toHaveProperty('userId');
    expect(req).toHaveProperty('token');
    expect(req.token).toEqual('token');
  });

  it('TESTING isAuthV2: should call UsersFunction.updateLastActiveAt()', async () => {
    await createUser();
    const auth = require('../../../middlewares/auth');
    let req = {
      headers: {
        authorization: 'Bearer token'
      }
    };
    const res = {
      status: () => ({
        json: jest.fn()
      })
    };
    const next = jest.fn();
    await auth.isAuthV2(req, res, next);
    expect(mockUpdateLastActiveAt).toHaveBeenCalled();
  });
});
