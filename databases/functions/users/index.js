const checkIsMe = require('./check-is-me');
const findActorId = require('./find-actor-id');
const findAnonymousUserId = require('./find-anonymous-user-id');
const findAnonymousUsername = require('./findAnonymousUsername');
const findMultipleUsersById = require('./find-multiple-user-by-id');
const findSignedUserId = require('./find-signed-user-id');
const findUserByHumanId = require('./find-user-by-human-id');
const findUserById = require('./find-user-by-id');
const findUserByUsername = require('./find-user-by-username');
const register = require('./users-register');
const registerAnonymous = require('./users-register-anonymous');
const updateLastActiveAt = require('./update-last-active-at');

const UsersFunction = {
  checkIsMe,
  findActorId,
  findAnonymousUserId,
  findAnonymousUsername,
  findMultipleUsersById,
  findSignedUserId,
  findUserByHumanId,
  findUserById,
  findUserByUsername,
  register,
  registerAnonymous,
  updateLastActiveAt
};

module.exports = UsersFunction;
