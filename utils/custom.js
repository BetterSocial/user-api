const convertString = (str, from, to) => {
    return str.split(from).join(to)
}

const dateCreted = {
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
};

module.exports = {
    convertString, dateCreted
}
