const emojiUnicode = require("emoji-unicode");
const _ = require("lodash");

const convertString = (str, from, to) => {
    return str?.split(from)?.join(to);
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
    if (/\p{Emoji}/u.test(topic)) {
        let newTopic = topic.replace(/\p{Emoji}/u, (char) => emojiUnicode(char))
        return "emoji" + newTopic.slice(0, 5) + newTopic.slice(7)
    }
    return topic
}

function getFirstStringFromSplit(str, splitChar = ',') {
    if(!str) return ""; 
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

        let neighborhood = convertString(item?.neighborhood?.toLowerCase(), " ", "-");
        let city = convertString(getFirstStringFromSplit(item?.city?.toLowerCase(), ','), " ", "-");
        let state = convertString(item?.state?.toLowerCase(), " ", "-");
        let country = convertString(item?.country?.toLowerCase(), " ", "-");

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
}

module.exports = {
    capitalizing,
    convertString,
    convertTopicWithEmoji,
    dateCreted,
    getToken,
    getFirstStringFromSplit,
    convertingUserFormatForLocation,
};
