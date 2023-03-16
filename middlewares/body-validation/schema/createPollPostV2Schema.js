const Schema = {
    
    message: "string|empty:false",
    verb: "string|empty:false",
    feedGroup: "string|empty:false",
    privacy: "string|empty:false",
    anonimity: "boolean|empty:false",
    location: "string|empty:false",
    duration_feed: "string|empty:false",
    polls: "array|empty:false",
    pollsduration: {
        $$type: "object",
        day: "number|empty:false",
        hour: "number|empty:false",
        minute: "number|empty:false",
    },
    multiplechoice: "boolean|empty:false",
    topics: "array|empty:true",
    location_id: "string|empty:true"
};

module.exports = Schema;