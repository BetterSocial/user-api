'use strict';

const path = require('path');
const jsonwebtoken = jest.createMockFromModule('jsonwebtoken');


function __sign(payload, token, opts) {

    return{



    }





};



jsonwebtoken.sign = __sign;

module.exports = jsonwebtoken;
