const stream = require("getstream");
const {
  downVote,
  getReaction,
  validationReaction,
  getDetailFeed,
  deleteReaction,
} = require("../../services/getstream");
const { convertString } = require("../../utils");
const { responseSuccess, responseError } = require("../../utils/Responses");
const { countProcess } = require("../../process");

// const getDetail = async (feedGroup, id, activityId) => {
//   const client = stream.connect(
//     process.env.API_KEY,
//     process.env.SECRET,
//     process.env.APP_ID
//   );
//   return await client.feed(feedGroup, id).getActivityDetail(activityId, {
//     withRecentReactions: true,
//   });
// };

module.exports = async (req, res) => {
  try {
    let token = req.token;
    const userId = req.userId
    let { activity_id, status, feed_group, domain } = req.body;
    // const data = await downVote(activity_id, token);
    // res.status(200).json(responseSuccess("Success upvote", data));
    // // console.log(status);
    let feeds = await getDetailFeed(
      token, activity_id
    );
    console.log(feeds, 'mantan')
    let feed = feeds.results[0];

    // if (status) {
      let latestReactions = feed.latest_reactions;
      if (JSON.stringify(latestReactions) !== "{}") {
        let downVotes = latestReactions.downvotes
        let upVotes = latestReactions.upvotes

         if(downVotes) {
          downVotes.filter((item) => item.user.id) === req.userId
          if(downVotes.length > 0) {
            let reaction = downVotes[0];
            deleteReaction(reaction.id);
          }
        }else {
          if(upVotes) {
            upVotes.filter((item) => item.user.id) === req.userId
            if(upVotes.length > 0) {
              let reaction = upVotes[0];
              deleteReaction(reaction.id);
            }
          }
          await downVote(activity_id, token);
        }
       
      } else {
      await downVote(activity_id, token);
      } 
      
      return res.status(200).json(responseSuccess("Success downvote"));
    // }
    //  else {
    //   // let reactionId = feed.
    //   let data = feed.latest_reactions.downvotes.filter(
    //     (item, i, arr) => item.user.id === req.userId
    //   );

    //   if (data.length > 0) {
    //     let reaction = data[0];
    //     await deleteReaction(reaction.id);
    //   }
    //   res.status(200).json(responseSuccess("Success cancel downvote"));
    // }
  } catch (errors) {
    console.log(errors);
    res.status(500).json(responseError("Failed downvote", null, 500));
  }
};
