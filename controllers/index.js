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

export default {
  welcome,
  getAllPosts,
  createPost,
  getUserDetails,
};
