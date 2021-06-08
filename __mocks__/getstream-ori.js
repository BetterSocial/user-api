// 'use strict';
//
// const path = require('path');
// const getstreamOri = jest.createMockFromModule('getstreamOri');
//
// function __connect (apiKey, apiSecret) {
//   return {
//       user: function(userId){
//         return {
//           create: function(data){
//             if ( data.name === "Kevin") {
//               return Promise.resolve(); // then
//             } else {
//               return Promise.reject(); // catch
//             }
//           }
//         }
//       }
//   };
// };
//
// getstreamOri.connect = __connect;
//
// module.exports = getstreamOri;
