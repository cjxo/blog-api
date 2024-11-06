import express from "express";
import auth from "../controllers/auth.js";

const authRouter = express.Router();

authRouter.post("/token", auth.acquireNewAccessTokenFromRefreshToken);
authRouter.delete("/sign-out", auth.removeRefreshTokenFromUser);
authRouter.post("/sign-up", auth.createNewUser);
authRouter.post("/sign-in", auth.acquireAccessAndRefreshTokens);

export default authRouter;
