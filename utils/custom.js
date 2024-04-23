const {NOTIFICATION_TOPIC_NAME_PREFIX} = require('../helpers/constants');
const roundingKarmaScore = require('../helpers/roundingKarmaScore');

const emojiUnicode = require('emoji-unicode');
const _ = require('lodash');

const convertString = (str, from, to) => {
  if (str === null || str === undefined) return str;
  return str?.split(from)?.join(to);
};

const dateCreted = {
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

const getToken = (req) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
    token = req.headers.authorization.split(' ')[1];
  } else {
    token = null;
  }

  return token;
};

function capitalizing(str) {
  return (
    str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
      })
      // uppercase the first character
      .replace(/^./, function (str) {
        return str.toUpperCase();
      })
  );
}

function convertTopicWithEmoji(topic) {
  if (/\p{Emoji}/u.test(topic)) {
    let newTopic = topic.replace(/\p{Emoji}/u, (char) => emojiUnicode(char));
    return 'emoji' + newTopic.slice(0, 5) + newTopic.slice(7);
  }
  return topic;
}

function getFirstStringFromSplit(str, splitChar = ',') {
  if (!str) return '';
  const [first] = str.split(splitChar);
  return first;
}

const convertingUserFormatForLocation = (locations) => {
  let loc = [];
  locations.map((item) => {
    /**
     * 1. cek location level is same with neigborhood, city, state or country
     * 2. - if location level same with neigborhood ambil semua value location dari neigborood -> city
     *    - if location level same with city then ambil semua data value location mulai dari city
     *    - if location level same with state maka ambil semua data value location state dan country
     *    - if location level same with country maka hanya ambil country saja
     * 3. convert semua location name menjadi lowercase
     * 4. bila ada space maka ganti space dengan -
     * 5.
     */

    let neighborhood = convertString(item?.neighborhood?.toLowerCase(), ' ', '-');
    let city = convertString(getFirstStringFromSplit(item?.city?.toLowerCase(), ','), ' ', '-');
    let state = convertString(item?.state?.toLowerCase(), ' ', '-');
    let country = convertString(item?.country?.toLowerCase(), ' ', '-');

    if (item?.location_level?.toLowerCase() == 'neighborhood') {
      loc.push(neighborhood);
      loc.push(city);
    } else if (item?.location_level?.toLowerCase() == 'city') {
      loc.push(city);
    } else if (item?.location_level?.toLowerCase() == 'state') {
      loc.push(state);
      loc.push(country);
    } else {
      loc.push(country);
    }
  });
  let temp = _.union(loc);
  return temp;
};

const convertLocationFromModel = (locationModel, isTO = false) => {
  const {location_level, country, city, state, neighborhood} = locationModel;
  if (!locationModel) return '';
  if (location_level === 'Country') return country;
  if (location_level === 'State') return state;
  if (location_level === 'City' && isTO)
    return city?.split(',')[0]?.split(' ').join('-')?.toLowerCase();
  if (location_level === 'City') return city;
  if (location_level === 'Neighborhood') return neighborhood;

  return '';
};

const setChildCommentLv2 = (childCommentLv2, karmaScores, mySignUserId, myAnonymousId) => {
  let new_child_comment_lv2 = childCommentLv2 || [];
  return new_child_comment_lv2.map((child2) => {
    const child2_user = karmaScores.find((user) => user.user_id === child2.user_id);
    if (child2.data.anon_user_info_emoji_name) {
      return {
        ...child2,
        user_id: null,
        user: {},
        target_feeds: [],
        is_you: myAnonymousId === child2.user_id,
        karmaScores: roundingKarmaScore(child2_user?.karma_score || 0)
      };
    }
    return {
      ...child2,
      is_you: mySignUserId === child2.user_id,
      karmaScores: roundingKarmaScore(child2_user?.karma_score || 0)
    };
  });
};

const handleAnonymousData = async (
  data,
  req,
  postAuthorId,
  myAnonymousId,
  anonymId,
  karmaScores = []
) => {
  let childComment = data.latest_children?.comment || [];
  childComment = await Promise.all(
    childComment.map(async (child) => {
      const user = karmaScores.find((user) => user.user_id === child.user_id);
      if (child?.data?.anon_user_info_emoji_name) {
        let childCommentLv2Anon = setChildCommentLv2(
          child?.latest_children?.comment,
          karmaScores,
          req.userId,
          myAnonymousId
        );
        return {
          ...child,
          latest_children: {comment: childCommentLv2Anon},
          user_id: null,
          karmaScores: roundingKarmaScore(user?.karma_score || 0),
          user: {},
          target_feeds: [],
          is_you: myAnonymousId === child.user_id,
          is_author: postAuthorId === child.user_id
        };
      }

      let childCommentLv2 = setChildCommentLv2(
        child?.latest_children?.comment,
        karmaScores,
        req.userId,
        myAnonymousId
      );
      return {
        ...child,
        latest_children: {comment: childCommentLv2},
        karmaScores: roundingKarmaScore(user?.karma_score || 0),
        is_you: req.userId === child.user_id,
        is_author: child.user_id === postAuthorId
      };
    })
  );
  const user = karmaScores.find((user) => user.user_id === data.user_id);
  if (data.data.anon_user_info_emoji_name) {
    return {
      ...data,
      user_id: null,
      user: {},
      karmaScores: roundingKarmaScore(user?.karma_score || 0),
      target_feeds: [],
      is_you: anonymId === myAnonymousId,
      is_author: postAuthorId === anonymId,
      latest_children: {comment: childComment}
    };
  }
  return {
    ...data,
    karmaScores: roundingKarmaScore(user?.karma_score || 0),
    is_you: req.userId === data.user_id,
    is_author: data.user_id === postAuthorId,
    latest_children: {comment: childComment}
  };
};

const removePrefixTopic = (topicWithPrefix) => {
  if (topicWithPrefix === null || topicWithPrefix === undefined) return;

  if (topicWithPrefix.indexOf(NOTIFICATION_TOPIC_NAME_PREFIX) > -1) {
    const topic = convertString(topicWithPrefix, NOTIFICATION_TOPIC_NAME_PREFIX, '');
    return topic;
  }

  return topicWithPrefix;
};

module.exports = {
  dateCreted,

  capitalizing,
  convertLocationFromModel,
  convertString,
  convertTopicWithEmoji,
  convertingUserFormatForLocation,
  getFirstStringFromSplit,
  getToken,
  handleAnonymousData,
  removePrefixTopic
};
