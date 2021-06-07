const stream = require("getstream");
const jwt = require("jsonwebtoken");

module.exports = async (reactionId, kind, token) => {
  const userId = await jwt.decode(token).user_id;
  // const clientUser = stream.connect(
  //   process.env.API_KEY,
  //   token,
  //   process.env.APP_ID
  // );

  const clientServer = stream.connect(process.env.API_KEY, process.env.SECRET);
  /**
   * 1. ambil semua data dari kind upvotes
   * 2. ambil semua data dari kind downvotes
   * 3. validasi jenis kind dari params
   * 4. exp kind upvotes
   * 5. validasi di kind downvotes tidak ada id yang sama bila sama return false
   * 6. validasi di data kind upvotes masih belum ada id yang sama
   * 7. bila tidak ada yang sama buat upvotes
   *  */
  const dataKindUpvotes = await clientServer.reactions.filter({
    activity_id: reactionId,
    kind: "upvotes",
    id_gt: "76c51573-227c-4080-89d9-e98def4ea7f5",
  });
  const dataKindDownvotes = await clientServer.reactions.filter({
    activity_id: reactionId,
    kind: "downvotes",
    id_gt: "76c51573-227c-4080-89d9-e98def4ea7f5",
  });

  if (kind === "upvotes") {
    let reactionDownvotes = dataKindDownvotes.results.filter(
      (item) => item.user_id === userId
    );
    if (reactionDownvotes.length === 0) {
      let reactionUpvotes = dataKindUpvotes.results.filter(
        (item) => item.user_id === userId
      );
      if (reactionUpvotes.length === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    let reactionUpvotes = dataKindUpvotes.results.filter(
      (item) => item.user_id === userId
    );
    if (reactionUpvotes.length === 0) {
      let reactionDownvotes = dataKindDownvotes.results.filter(
        (item) => item.user_id === userId
      );
      if (reactionDownvotes.length === 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
};
