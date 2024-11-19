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
    const posts = await db.getAllPublishedPosts();
    res.json({
      message: "Request Granted.",
      posts 
    });

    console.log(posts);
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

export default {
  welcome,
  getAllPosts,
  createPost,
  getUserDetails,
  postComment,
  getAllComments,
  toggleLikeDislike,
};
