// 'use strict';
//
// const path = require('path');
// const getstream = jest.createMockFromModule('getstream');
//
// function __connect (apiKey, apiSecret) {
//     return {
//         user: function(userId){
//             return {
//                 create: function(data){
//                     if ( data.name === "Kevins") {
//                         console.log(" slur");
//                         return Promise.resolve(); // then
//                     } else {
//                         console.log("salagh slur");
//                         return Promise.reject(); // catch
//                     }
//                 }
//             }
//         }
//     };
// };
//
// getstream.connect = __connect;
//
// module.exports = getstream;
