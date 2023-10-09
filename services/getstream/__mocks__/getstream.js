'use strict';

const getstream = jest.createMockFromModule('getstream');
const sample_data_activities = require('./sample_data_activities');

function __connect() {
  return {
    reactions: {
      addChild: function (kind, reaction, data) {
        //childDownvote
        if (kind === 'downvotes') {
          expect(kind).toBe('downvotes');
          expect(reaction.id).toBe('be3d1e52-b22a-4181-be1c-c4029a523bc1');
          expect(data.count_downvote).toBe(1);
        }

        //childUpVote
        if (kind === 'upvotes') {
          expect(kind).toBe('upvotes');
          expect(reaction.id).toBe('be3d1e52-b22a-4181-be1c-c4029a523bc1');
          expect(data.count_upvote).toBe(1);
        }

        //commentChild
        if (kind === 'comment') {
          expect(kind).toBe('comment');
          expect(reaction.id).toBe('05bafac3-36ea-4642-8391-65364d15322c');
          expect(data.text).toBe('this_is_child_comment');
          expect(data.count_upvote).toBe(0);
          expect(data.count_downvote).toBe(0);
        }
      },

      add: function (kind, activityId, data) {
        //comment
        if (kind === 'comment') {
          expect(kind).toBe('comment');
          expect(activityId).toBe('05bafac3-36ea-4642-8391-65364d15322c');
          expect(data.text).toBe('this_is_a_comment');
          expect(data.count_upvote).toBe(0);
          expect(data.count_downvote).toBe(0);
        }

        //createReaction
        if (kind === 'createReaction-action') {
          expect(kind).toBe('createReaction-action');
          expect(activityId).toBe('a9d933ac-985c-4900-9a0b-44a7bdc97042');
          expect(data).toBe('message is here');
        }

        //downVote
        if (kind === 'downvotes') {
          expect(kind).toBe('downvotes');
          expect(activityId.id).toBe('e178d362-7e1d-4013-86a2-84d09a19c350');
          expect(data.count_downvote).toBe(1);
        }

        //like
        if (kind === 'like') {
          expect(kind).toBe('like');
          expect(activityId).toBe('4fb669a3-06b4-45cc-93b6-41e1336f5103');
        }

        //upVote
        if (kind === 'upvotes') {
          expect(kind).toBe('upvotes');
          expect(activityId.id).toBe('e178d362-7e1d-4013-86a2-84d09a19c350');
          expect(data.count_upvote).toBe(1);
        }
      },

      //deleteReaction
      delete: function (reactionId) {
        expect(reactionId).toBe('4fb669a3-06b4-45cc-93b6-41e1336f5103');
      },

      //getReaction
      get: function (reactionId) {
        expect(reactionId).toBe('b728e733-b235-4b62-a595-1a1ff4180162');
      },

      //updateReaction
      update: function (reactionId, data) {
        expect(reactionId).toBe('0676b81f-164a-4bea-899f-a286b4190af8');
        expect(data.text).toBe('message is here');
        expect(data.count_upvote).toBe(0);
        expect(data.count_downvote).toBe(0);
      }
    },

    //createToken
    createUserToken: function (userId, json) {
      expect(userId).toBe('d24f6c17-f20e-4cc9-8df1-45f1fa4dcf52');

      let token = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
      expect(json.exp).toBe(token);
    },

    // getFeeds: function (token, feedGroup, query) {
    //   expect(token).toBe('Bi9jNv9TCv11TfjkbUz37I75zea2VFue');
    //   expect(feedGroup).toBe('main_feed_following');
    // },

    //deleteFeed  ||  getfeed  ||  followLocation  || cretePost
    feed: function (feedGroup, userId, token) {
      //followLocation
      if (feedGroup === 'main_feed') {
        expect(feedGroup).toBe('main_feed');
      }

      // getFeed
      else if (feedGroup === 'main_feed_following') {
        expect(feedGroup).toBe('main_feed_following');
        return {
          //deleteFeed
          removeActivity: function (data) {
            expect(data.foreignId).toBe('4fb669a3-06b4-45cc-93b6-41e1336f5103');
          },

          //getFeed
          get: function () {
            return {
              results: []
            };
          }
        };
      }

      //createPost
      else if (feedGroup === 'create-post') {
        expect(feedGroup).toBe('create-post');
        expect(token).toBe('G5ZwsYk6HZJMey2zCmDBetEBVOb8Ap1G');
      }

      //delete_feed, getfeed
      // else {
      //   expect(feedGroup).toBe('example_feed');
      //   expect(token).toBe('XRT0XKwzedFMVzUZkcuJROk9Le3VGVj0');
      // }

      return {
        //deleteFeed
        removeActivity: function (data) {
          expect(data.foreignId).toBe('4fb669a3-06b4-45cc-93b6-41e1336f5103');
        },

        //getFeed
        get: function () {
          return {
            results: sample_data_activities
          };
        },

        //followLocation || followUser || followTopic
        follow: function (targetSlug, id) {
          //followLocation
          if (targetSlug === 'location') {
            expect(targetSlug).toBe('location');
            expect(id).toBe('90245907-f687-44af-b6bf-543701508840');
          }

          //followUser  --follow
          if (targetSlug === 'follow-user') {
            expect(targetSlug).toBe('follow-user');
            expect(id).toBe('90245907-f687-44af-b6bf-543701508840');
          }

          //followTopic
          if (targetSlug === 'topic') {
            expect(targetSlug).toBe('topic');
            expect(id).toBe('90245907-f687-44af-b6bf-543701508840');
          }
        },

        //followUser  --unfollow
        unfollow: function (feedGroup, id) {
          expect(feedGroup).toBe('unfollow-user');
          expect(id).toBe('90245907-f687-44af-b6bf-543701508840');
        },

        //createPost
        addActivity: function (data) {
          expect(data).toHaveProperty('foreign_id');
          expect(data).toHaveProperty('actor');
        }
      };
    },

    //createUser  ||  createPost
    user: function () {
      return {
        create: function (data) {
          if (data.name === 'User') {
            return Promise.resolve(); // then
          } else {
            return Promise.reject(); // catch
          }
        },

        //createPost
        ref: function () {}
      };
    },

    //followLocation  ||  followUser
    followMany: function (follows) {
      follows.map((item) => {
        expect(item).toHaveProperty('source');
        expect(item).toHaveProperty('target');
      });
    }
  };
}

getstream.connect = __connect;

module.exports = getstream;
