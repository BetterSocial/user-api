const Schema = {
    reaction_id: "string|empty:false",
    useridFeed: "string|empty:false",
    message: "string|empty:false",
    postMaker: "string|empty:false",
    anonimity: "boolean|empty:false",
    sendPostNotif: "boolean|empty:true",
}

module.exports = Schema