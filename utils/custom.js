const convertString = (str, from, to) => {
    return str.split(from).join(to)
}

const dateCreted = {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

const getToken = (req) => {
    let token
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        token = req.headers.authorization.split(' ')[1];
    } else {
        token = null
    }

    return token
}

module.exports = {
    convertString, dateCreted, getToken
}
