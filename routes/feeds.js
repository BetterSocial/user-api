const express = require("express");
const router = express.Router();

// controller
const feedController = require("../controllers/feeds/FeedController");

const feed = require("../controllers/feeds");
const { isAuth, isAuthV2, isAuthAnonim } = require("../middlewares/auth");
const CreatePostMiddleware = require("../middlewares/create-post");
const GenerateAnonymousUsernameMiddleware = require("../middlewares/generate-anonymous-username");
const CreateCommentMiddleware = require("../middlewares/create-comment");
const CreateCommentChildMiddleware = require("../middlewares/create-comment-child");
const BodyValidationMiddleware = require("../middlewares/body-validation");


router.post("/post", feed.createPost);
router.post("/post/poll", feed.createPollPost);
router.post("/post/poll/input", feed.inputPoll);
router.get("/post/is-author-follow-me/:postId", feed.isAuthorFollowMe);
router.post("/create-token", feedController.createToken);
router.get("/feeds", feed.getFeeds);
router.post("/reaction", feed.createReaction);
router.post("/reactions", isAuth, feed.getReaction);
router.post("/follow-user", feed.followUser);
router.post("/upvote", feed.upvote);
router.post("/downvote", feed.downvote);
router.post("/comment", feed.comment);
router.post("/comment-domain", feed.commentDomain);
router.post("/child-comment", feed.commentChild);
router.post("/like", feed.like);
router.post("/delete-feed", feed.deleteFeed);
router.get("/user", feed.getFeedUser);
router.post("/child-upvote", feed.childUpvote);
router.post("/child-downvote", feed.childDownvote);
router.post("/update-reaction", feed.updateReaction);
router.post("/delete-reaction", feed.deleteReaction);
router.post("/update-activity", feed.putMainFeed);
router.get("/detail-feed", isAuth, feed.detailFeed);
router.post("/upvote-domain", feed.upVoteDomain);
router.post("/downvote-domain", feed.downVoteDomain);
router.post("/viewpost", feed.createQueuePostTime);
router.post("/vote_comment", isAuth, feed.voteComment);
router.get("/i_vote_comment", isAuth, feed.iVoteComment);
router.get("/feed-chat/", isAuth, feed.getFeedChatService)
router.post("/open-graph", isAuth, feed.getOpenGraph)
router.delete('/:postId', isAuth, feed.deletePost)
router.delete('/anonymous/:postId', isAuth, feed.deleteAnonymousPost)

router.post("/feed-action-notification/:kind", isAuth, feed.notificationCommentFeed)
router.post("/post-v2", isAuth, CreatePostMiddleware ,feed.createPostV2);
router.post('/generate-anonymous-username', isAuth, GenerateAnonymousUsernameMiddleware, feed.generateAnonymousUsername)
router.post("/comment-v2", isAuth ,CreateCommentMiddleware , feed.commentV2);
router.post('/comment-v3', isAuthV2, CreateCommentMiddleware , feed.commentV3.standart);
router.post('/comment-v3-anonymous', isAuthAnonim, CreateCommentMiddleware , feed.commentV3.anonymous);
router.post("/comment-child-v2", isAuth, CreateCommentChildMiddleware, feed.commentChildV2);
router.post("/comment-child-v3", isAuthV2, CreateCommentChildMiddleware, feed.commentChildV3.standart);
router.post("/comment-child-v3-anonymous", isAuthAnonim, CreateCommentChildMiddleware, feed.commentChildV3.anonymous);
router.post("/comment-domain-v2", isAuth, CreateCommentMiddleware, feed.commentDomainV2);
router.post("/comment-domain-v3", isAuthV2, CreateCommentMiddleware, feed.commentDomainV3.standart);
router.post("/comment-domain-v3-anonymous", isAuthAnonim, CreateCommentMiddleware, feed.commentDomainV3.anonymous);
router.post("/block-anonymous-post-v2", isAuth, BodyValidationMiddleware.blockAnonymousPostV2, feed.blockAnonymousPostV2);
router.get("/reaction-list/:id", isAuth, feed.reactionList)

module.exports = router;