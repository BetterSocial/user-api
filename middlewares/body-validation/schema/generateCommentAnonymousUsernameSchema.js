const Schema = {
    contentType: {
        type: 'string',
        empty: false,
        enum: ['comment'],
    },
    postId: 'string|empty:false',
}

module.exports = Schema