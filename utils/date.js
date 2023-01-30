const moment = require('moment')

const isDateExpired = (date, days = 0) => {
    const now = moment()
    const dateToCheck = moment(date)
    const diff = now.diff(dateToCheck, 'seconds')
    return diff > days
}

const DateUtils = {
    isDateExpired
}

module.exports = DateUtils