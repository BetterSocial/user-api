const InitDiscoveryUserData = require('./InitDiscoveryUserData')
const InitDiscoveryTopicData = require('./InitDiscoveryTopicData')
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