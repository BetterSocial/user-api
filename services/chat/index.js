const CreateChannel = require('./createChannel');
const AddMembersChannel = require('./AddMemberChannel');
const WatchChannel = require('./WatchChannel');
const MemberService = require('./MemberService');

module.exports = {
  CreateChannel,
  AddMembersChannel,
  WatchChannel,
  ...MemberService
};
