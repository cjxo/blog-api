import db from "../db/query.js";

const dateNow = () => {
  return new Date().toISOString();
};

const welcome = (req, res) => {
  res.json({
    message: "Welcome to BlogForge API!",
  });
};

const getAllPosts = async (req, res, next) => {
  try {
    const posts = await db.getAllPublishedPosts(null, "all-posts");
    res.json({
      message: "Request Granted",
      posts 
    });

    console.log(posts);
  } catch (err) {
    next(err);
  }
};

const getUserPosts = async (req, res, next) => {
  let user_id = 0;
  if (req.params.id) {
    user_id = parseInt(req.params.id);
  } else {
    user_id = 0;
  }

  try {
    console.log(req.query);
    const posts = await db.getAllPublishedPosts(user_id, req.query.filterBy);
    res.json({
      message: "Request Granted",
      posts 
    });

    console.log(user_id, posts);
  } catch (err) {
    next(err);
  }
};

const createPost = async (req, res, next) => {
  try {
    const user       = req.user;
    const title      = req.body.title;
    const content    = req.body.content;
    const published  = req.body.published ? true : false;

    if (!title || (title === "")) {
      return res.status(400).json({
        message: "The post should have a title.",
      });
    }

    if (!content || (content === "")) {
      return res.status(400).json({
        message: "The post should have a content.",
      });
    }

    await db.createUserPost(user.id, title, content, published);
    res.json({
      message: "Post Created.",
    });
  } catch (err) {
    next(err);
  } 
};

const getUserDetails = async (req, res, next) => {
  const userID  = parseInt(req.params.id);
  
  try {
    const userIdentity = await db.getUserDetails(userID);
    res.json({
      message: "Request Granted.",
      user: userIdentity,
    });
  } catch (err) {
    next(err);
  }
};

const postComment = async (req, res, next) => {
  const user = req.user;
  const post_id = req.params.id;
  const content = req.body.content;
  try {
    const comment_id = await db.addCommentToPost(post_id, user.id, content);
    res.json({
      message: "Request Granted",
      commentDetail: {
        id: comment_id,
        username: user.username,
        content: content,
        likes: 0,
        dislikes: 0,
        user_reaction: 'none',
      }
    });
  } catch (err) {
    next(err);
  }
};

const getAllComments = async (req, res, next) => {
  const post_id = req.params.id;

  const user_id = req.user.id || 0;
  try {
    const comments = await db.getAllComments(post_id, user_id);
    res.json({
      message: "Request Granted",
      comments,
    });
  } catch (err) {
    next(err);
  }
}

const toggleLikeDislike = async (req, res, next) => {
  //const post_id = req.params.postId;
  const comment_id = req.params.commentId;
  const user_id = req.user.id || 0;
  const type = req.body.type || "none";
  try {
    console.log(comment_id);
    const newValue = await db.toggleLikeDislike(comment_id, user_id, type);
    res.json({
      message: "Request Granted",
      newValue,
    });
  } catch (err) {
    next(err);
  }
};

const getPostStatistics = async (req, res, next) => {
  const post_id = req.params.postId;
  const user_id = req.user.id || 0;
  try {
    const result = await db.getPostStatistics(post_id, user_id);
    res.json({
      message: "Request Granted",
      ...result,
    });
  } catch (err) {
    next(err);
  }
};

const setPostStatistics = async (req, res, next) => {
  const post_id = req.params.postId;
  const user_id = req.user.id || 0;
  const statistics = req.body;
  try {
    const result = await db.setPostStatistics(post_id, user_id, statistics);
    res.json({ message: "Request Granted", setData: result });
  } catch (err) {
    next(err);
  }
};

const deletePost = async (req, res, next) => {
  const post_id = req.params.postId;
  const user_id = req.user.id || 0;
  try {
    const result = await db.deletePost(post_id, user_id);
    res.json({ message: "Request Granted" });
  } catch (err) {
    next(err);
  }
};

export default {
  welcome,
  getAllPosts,
  createPost,
  getUserDetails,
  getUserPosts,
  postComment,
  getAllComments,
  toggleLikeDislike,
  getPostStatistics,
  setPostStatistics,
  deletePost,
};
