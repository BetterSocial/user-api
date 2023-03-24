const Schema = {
    reaction_id: "string|empty:false",
    useridFeed: "string|empty:false",
    message: "string|empty:false",
    postMaker: "string|empty:false",
    anonimity: "boolean|empty:false",
    sendPostNotif: "boolean|empty:true",
    anon_user_info: {
        $$type: "object",
        color_name: "string|empty:false",
        color_code: "string|empty:false",
        emoji_name: "string|empty:false",
        emoji_code: "string|empty:false",
    }
}

module.exports = Schema