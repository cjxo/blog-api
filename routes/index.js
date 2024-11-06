import express from "express";
import index from "../controllers/index.js";
import auth from "../controllers/auth.js";

const indexRouter = express.Router();

indexRouter.get("/", index.welcome);
indexRouter.get("/posts", index.getAllPosts);
indexRouter.post("/posts", auth.verifyToken, index.createPost);
indexRouter.get("/user/:id", index.getUserDetails);

export default indexRouter;
