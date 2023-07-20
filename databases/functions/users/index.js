const register = require('./users-register');
const registerAnonymous = require('./users-register-anonymous');
const findAnonymousUserId = require('./find-anonymous-user-id');
const findUserById = require('./find-user-by-id');
const findMultipleUsersById = require('./find-multiple-user-by-id');
const findUserByHumanId = require('./find-user-by-human-id');
const findSignedUserId = require('./find-signed-user-id');
const findActorId = require('./find-actor-id');
const findAnonymousUsername = require('./findAnonymousUsername');

const UsersFunction = {
  register,
  registerAnonymous,
  findAnonymousUserId,
  findUserById,
  findMultipleUsersById,
  findUserByHumanId,
  findSignedUserId,
  findActorId,
  findAnonymousUsername
};

module.exports = UsersFunction;
