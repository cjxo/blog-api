import express from "express";
import index from "../controllers/index.js";
import auth from "../controllers/auth.js";

const indexRouter = express.Router();

indexRouter.get("/", index.welcome);
indexRouter.get("/posts", index.getAllPosts);
indexRouter.post("/posts", auth.verifyToken, index.createPost);
indexRouter.get("/user/:id", index.getUserDetails);
indexRouter.get("/user/:id/posts", index.getUserPosts);
indexRouter.post("/posts/:id/comment", auth.verifyToken, index.postComment);
indexRouter.get("/posts/:id/comments", auth.verifyToken, index.getAllComments);
indexRouter.post("/posts/:postId/comment/:commentId/like", auth.verifyToken, index.toggleLikeDislike);
indexRouter.get("/posts/:postId/statistics", auth.verifyToken, index.getPostStatistics);
indexRouter.put("/posts/:postId/statistics", auth.verifyToken, index.setPostStatistics);
indexRouter.delete("/posts/:postId/", auth.verifyToken, index.deletePost);

export default indexRouter;
