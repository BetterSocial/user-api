const Schema = {
    message: "string",
    verb: "string|empty:false",
    feedGroup: "string|empty:false",
    privacy: "string|empty:false",
    anonimity: "boolean|empty:false",
    location: "string|empty:false",
    duration_feed: "string|empty:false",
    topics: "array|nullable:true",
    location_id: "string|empty:true",
    images_url: "array|empty:true",
    anon_user_info: {
        $$type: "object",
        color_name: "string|empty:false",
        color_code: "string|empty:false",
        emoji_name: "string|empty:false",
        emoji_code: "string|empty:false",
    }
};

module.exports = Schema;