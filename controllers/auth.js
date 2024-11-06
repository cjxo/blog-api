import db from "../db/query.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import 'dotenv/config';

const createAccessToken = (user) => {
  return jwt.sign({ user }, process.env.ACCESS_TOKEN, { expiresIn: '30s' });
};

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];

  if (bearerHeader) {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token." })
      }

      req.user = authData.user;
      next();
    });
  } else {
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }
};

const acquireNewAccessTokenFromRefreshToken = async (req, res, next) => {
  const refreshToken = req.headers["token"];
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }

  try { 
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token." });
      }
      
      const user = authData.user;
      const desiredUser = {
        id: user.id,
        username: user.username,
      };

      const hasRefreshToken = await db.userHasRefreshToken(user.id, refreshToken);
      if (!hasRefreshToken) {
        return res.status(403).json({ message: "Forbidden: Invalid token." });
      }

      const accessToken = createAccessToken(desiredUser);
      res.json({ accessToken });
    });
  } catch (err) {
    return next(err);
  }
};

const removeRefreshTokenFromUser = async (req, res, next) => {
  const refreshToken = req.headers["token"];
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }

  try { 
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token." })
      }
      
      const user = authData.user;
      const hasRefreshToken = await db.userHasRefreshToken(user.id, refreshToken); 
      if (!hasRefreshToken) {
        return res.status(403).json({ message: "Forbidden: Invalid token." });
      }

      await db.deleteRefreshTokenFromUser(user.id, refreshToken);
      res.status(204).json({ message: "Deleted refresh token." });
    });
  } catch (err) {
    next(err);
  }
};

const createNewUser = async (req, res, next) => {
  try {
    if (!req.body.username || !req.body.email || !req.body.password) {
      res.status(400).json({
        message: "All fields [username, email, passwords] are required."
      });
    }

    const { usernameExists, emailExists } = await db.usernameOrEmailExists(req.body.username, req.body.email);
    if (usernameExists) {
      return res.status(409).json({
        message: "Username already exists."
      });
    }

    if (emailExists) {
      return res.status(409).json({
        message: "Email already exists."
      });
    }

    await db.createNewUserAndReturnID(req.body.username, req.body.password, req.body.email);
    res.status(201).json({
      message: "Successfully created user. Please sign in."
    });
  } catch (err) {
    next(err);
  }
};

const acquireAccessAndRefreshTokens = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  try {
    const user = await db.getUserFromUsername(username);

    if (!user) {
      return res.status(400).json({ invalidUserName: true });
    }

    const passwordsMatched = await bcrypt.compare(password, user.password);
    if (!passwordsMatched) {
      return res.status(400).json({ invalidUserPassword: true });
    }

    const desiredUser = {
      id: user.id,
      username: user.username,
    };

    const accessToken  = createAccessToken(desiredUser);
    const refreshToken = jwt.sign({ user: desiredUser }, process.env.REFRESH_TOKEN);
    await db.insertRefreshTokenToUser(user.id, refreshToken);
    res.json({
      message: "Sign In Successful.",
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } catch (err) {
    next(err);
  } 
};

export default {
  verifyToken,
  acquireNewAccessTokenFromRefreshToken,
  removeRefreshTokenFromUser,
  createNewUser,
  acquireAccessAndRefreshTokens,
};
