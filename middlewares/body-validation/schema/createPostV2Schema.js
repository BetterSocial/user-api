const Schema = {
    message: "string|empty:false",
    verb: "string|empty:false",
    feedGroup: "string|empty:false",
    privacy: "string|empty:false",
    anonimity: "boolean|empty:false",
    location: "string|empty:false",
    duration_feed: "string|empty:false",
    topics: "array|nullable:true",
    location_id: "string|empty:true",
    images_url: "array|empty:true",
};

module.exports = Schema;