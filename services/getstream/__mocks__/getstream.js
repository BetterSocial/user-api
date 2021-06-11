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

        reactions: {

            addChild: function (kind, reaction, data){
                //childDownvote
                if (kind === "downvotes") {
                    expect(kind).toBe("downvotes");
                    expect(reaction.id).toBe("be3d1e52-b22a-4181-be1c-c4029a523bc1");
                    expect(data.count_downvote).toBe(1);
                }

                //childUpVote
                if (kind === "upvotes") {
                    expect(kind).toBe("upvotes");
                    expect(reaction.id).toBe("be3d1e52-b22a-4181-be1c-c4029a523bc1");
                    expect(data.count_upvote).toBe(1);
                }

                //commentChild
                if (kind === "comment") {
                    expect(kind).toBe("comment");
                    expect(reaction.id).toBe("05bafac3-36ea-4642-8391-65364d15322c");
                    expect(data.text).toBe("this_is_child_comment");
                    expect(data.count_upvote).toBe(0);
                    expect(data.count_downvote).toBe(0);
                }

            },

            add: function (kind, activityId, data) {
                //comment
                if (kind === "comment") {
                    expect(kind).toBe("comment");
                    expect(activityId).toBe("05bafac3-36ea-4642-8391-65364d15322c");
                    expect(data.text).toBe("this_is_a_comment");
                    expect(data.count_upvote).toBe(0);
                    expect(data.count_downvote).toBe(0);
                }

                //createReaction
                if (kind === "createReaction-action") {
                    expect(kind).toBe("createReaction-action");
                    expect(activityId).toBe("a9d933ac-985c-4900-9a0b-44a7bdc97042");
                    expect(data).toBe("message is here");
                }

                //downVote
                if (kind === "downvotes") {
                    expect(kind).toBe("downvotes");
                    expect(activityId.id).toBe("e178d362-7e1d-4013-86a2-84d09a19c350");
                    expect(data.count_upvote).toBe(1);
                }

                //like
                if (kind === "like") {
                    expect(kind).toBe("like");
                    expect(activityId).toBe("4fb669a3-06b4-45cc-93b6-41e1336f5103");
                }

                //upVote
                if (kind === "upvotes") {
                    expect(kind).toBe("upvotes");
                    expect(activityId.id).toBe("e178d362-7e1d-4013-86a2-84d09a19c350");
                    expect(data.count_upvote).toBe(1);
                }
            },

            //deleteReaction
            delete: function (reactionId){
                expect(reactionId).toBe("4fb669a3-06b4-45cc-93b6-41e1336f5103");
            },

            //getReaction
            get: function (reactionId){
                expect(reactionId).toBe("b728e733-b235-4b62-a595-1a1ff4180162");

            },

            //updateReaction
            update: function (reactionId, data){
                expect(reactionId).toBe("0676b81f-164a-4bea-899f-a286b4190af8",);
                expect(data.text).toBe("message is here");
                expect(data.count_upvote).toBe(0);
                expect(data.count_downvote).toBe(0);
            }
        },

        //createToken
        createUserToken: function (userId, json){
            expect(userId).toBe("d24f6c17-f20e-4cc9-8df1-45f1fa4dcf52");

            let token = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
            expect(json.exp).toBe(token);

        },

        //deleteFeed
        feed: function(feedGroup, userId, token){
            expect(feedGroup).toBe("example_feed");
            expect(token).toBe("XRT0XKwzedFMVzUZkcuJROk9Le3VGVj0");

          return {
              //deleteFeed
              removeActivity: function (data){
                  expect(data.foreignId).toBe("4fb669a3-06b4-45cc-93b6-41e1336f5103");
              },

              //getFeed
              get: function (query){
                  expect(query).toBe("select_*_from_table");
              }

          }
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
