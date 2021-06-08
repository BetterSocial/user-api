'use strict';

const path = require('path');
const getstream = jest.createMockFromModule('getstream');

// function __connect(apiKey, token, apiSecret) {
//     return {
//         //createReaction
//         reactions: {
//             // ret {
//             add: function (kind, activityId, message) {
//                 console.log(kind);
//                 console.log(activityId);
//                 console.log(message);
//
//
//                 return message;
//             }
//             // }
//         }
//     }
// };

function __connect (apiKey, apiSecret) {
    return {
        //createReaction
        reactions: {
            add: function (kind, activityId, message) {
                console.log(kind);
                console.log(activityId);
                console.log(message);

                return message;
            }
        },

        //createToken
        createUserToken: function (userId, json){
            let token = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
            expect(json.exp).toBe(token);

            return json;
        },

        //createUser
        user: function(userId){
            return {
                create: function(data){
                    if ( data.name === "User") {
                        return Promise.resolve(); // then
                    } else {
                        return Promise.reject(); // catch
                    }
                }
            }
        }

    };

};



getstream.connect = __connect;

module.exports = getstream;
