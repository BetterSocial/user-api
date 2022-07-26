const emojiUnicode = require("emoji-unicode");

const convertString = (str, from, to) => {
  return str.split(from).join(to);
};

const dateCreted = {
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const getToken = (req) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "Bearer"
  ) {
    token = req.headers.authorization.split(" ")[1];
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
  if(/\p{Emoji}/u.test(topic)) {
    let newTopic = topic.replace(/\p{Emoji}/u, (char) => emojiUnicode(char))
    return "emoji" + newTopic.slice(0,5) + newTopic.slice(7)
  }
  return topic
}

module.exports = {
  capitalizing,
  convertString,
  convertTopicWithEmoji,
  dateCreted,
  getToken,
};
