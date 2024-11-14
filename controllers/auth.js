import db from "../db/query.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import 'dotenv/config';

const createAccessToken = (user) => {
  return jwt.sign({ user }, process.env.ACCESS_TOKEN, { expiresIn: '1d' });
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
  const refreshToken = req.cookies.refreshToken;

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

      const dbRefreshToken = await db.getRefreshTokenFromUserID(user.id);
      if (!dbRefreshToken || (dbRefreshToken !== refreshToken)) {
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
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }

  try { 
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN, async (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid token." })
      }
      
      const user = authData.user;

      const dbRefreshToken = await db.getRefreshTokenFromUserID(user.id);
      if (!dbRefreshToken || (dbRefreshToken !== refreshToken)) {
        return res.status(403).json({ message: "Forbidden: Invalid token." });
      }

      await db.deleteRefreshTokenFromUser(user.id);
      res.clearCookie("refreshToken");
      res.status(204).json({ message: "Deleted refresh token. Logged Out." });
    });
  } catch (err) {
    next(err);
  }
};

const createNewUser = async (req, res, next) => {
  try {
    if (!req.body.first_name || !req.body.last_name || !req.body.username || !req.body.email || !req.body.password) {
      res.status(400).json({
        message: "All fields [first_name, last_name, username, email, passwords] are required."
      });
    }

    const { firstNameExists, usernameExists, emailExists } = await db.checkUserFieldsExistence(req.body.first_name, req.body.username, req.body.email);
    if (firstNameExists) {
      return res.status(409).json({
        message: "First Name already exists."
      });
    }

    /*
     What if they're brothers/sisters/mom/dad? Lol
    if (lastNameExists) {
      return res.status(409).json({
        message: "Last Name already exists."
      });
    }*/

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

    await db.createNewUserAndReturnID(req.body.first_name, req.body.last_name, req.body.username, req.body.email, req.body.password);
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
      return res.status(400).json({ message: "Username does not exist." });
    }

    const passwordsMatched = await bcrypt.compare(password, user.password);
    if (!passwordsMatched) {
      return res.status(400).json({ message: "Wrong password." });
    }

    const desiredUser = {
      id: user.id,
      username: user.username,
    };

    const accessToken  = createAccessToken(desiredUser);
    let refreshToken = await db.getRefreshTokenFromUserID(user.id);
    if (!refreshToken) {
      refreshToken = jwt.sign({ user: desiredUser }, process.env.REFRESH_TOKEN, { expiresIn: '30d' });
      await db.insertRefreshTokenToUser(user.id, refreshToken);
    } else {
      await db.increaseTokenRefCount(user.id);
    }

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: "Strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    }).json({
      message: "Sign In Successful.",
      accessToken: accessToken,
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
