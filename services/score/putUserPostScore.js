const { getDb } = require("../../databases/config/mongodb_conn");
const { DB_COLLECTION_USER_POST_SCORE } = require("./constant");

module.exports = async (feed, userId) => {
  if ("score_details" in feed) {
    //console.debug("Has score details");

    const scoreDetails = feed.score_details;

    let db = await getDb();
    let userPostScoreList = await db.collection(DB_COLLECTION_USER_POST_SCORE);

    let userPostScoreDoc = await userPostScoreList.findOne({"_id": userId+":"+feed.id});
    if (userPostScoreDoc) {
      scoreDetails.__p1_score = userPostScoreDoc.p1_score;
      scoreDetails.__has_user_upvote = (userPostScoreDoc.upvote_count > 0);
      scoreDetails.__has_user_comment = (userPostScoreDoc.comment_count > 0);
      scoreDetails.__has_user_downvote = (userPostScoreDoc.downvote_count > 0);
      scoreDetails.__has_user_seen = (userPostScoreDoc.seen_count > 0);
      scoreDetails.__p_prev_score = userPostScoreDoc.p_prev_score;
      scoreDetails.__user_post_score = userPostScoreDoc.user_post_score;
    } else {
      scoreDetails.__p1_score = 0;
      scoreDetails.__has_user_upvote = false;
      scoreDetails.__has_user_comment = false;
      scoreDetails.__has_user_downvote = false;
      scoreDetails.__has_user_seen = false;
      scoreDetails.__p_prev_score = 0;
      scoreDetails.__user_post_score = 0;
    }
    //console.debug("Updated score details : "+JSON.stringify(scoreDetails));
  }
};


