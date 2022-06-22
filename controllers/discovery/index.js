const InitDiscoveryUserData = require('./initDiscoveryUserData')
const InitDiscoveryTopicData = require('./initDiscoveryTopicData')
const SearchUser = require('./searchUser')
const SearchDomain = require('./searchDomain')
const SearchTopic = require('./searchTopic')
const SearchNews = require('./searchNews')

const DiscoveryController = {
    InitDiscoveryTopicData,
    InitDiscoveryUserData,
    SearchUser,
    SearchDomain,
    SearchTopic,
    SearchNews,
}

module.exports = DiscoveryController