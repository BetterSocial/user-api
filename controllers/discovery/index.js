const InitDiscoveryUserData = require('./initDiscoveryUserData');
const InitDiscoveryTopicData = require('./initDiscoveryTopicData');
const InitDiscoveryDomainData = require('./initDiscoveryDomainData');
const SearchUser = require('./searchUser');
const SearchDomain = require('./searchDomain');
const SearchTopic = require('./searchTopic');
const SearchNews = require('./searchNews');

const DiscoveryController = {
  InitDiscoveryDomainData,
  InitDiscoveryTopicData,
  InitDiscoveryUserData,
  SearchUser,
  SearchDomain,
  SearchTopic,
  SearchNews
};

module.exports = DiscoveryController;
