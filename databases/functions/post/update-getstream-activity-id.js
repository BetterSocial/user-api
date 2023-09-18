/**
 *
 * @param {Model} postModel
 * @param {string} postId
 * @param {string} getstreamActivityId
 * @param {Transaction} transaction
 */
module.exports = async (postModel, postId, getstreamActivityId, transaction) => {
  try {
    const post = await postModel.findOne(
      {
        where: {
          post_id: postId
        }
      },
      {transaction}
    );

    return post?.update(
      {
        getstream_activity_id: getstreamActivityId
      },
      {transaction}
    );
  } catch (e) {
    console.log(e);
    return null;
  }
};
