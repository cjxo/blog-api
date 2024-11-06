import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import 'dotenv/config';
import db from "./db/query.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dateNow = () => {
  return new Date().toISOString();
};

const fakeUsers = [
  {
    id: 1,
    username: "whiggle",
    password: "coolpassword",
    email: "legitemail@somedomain.com",
  },
  {
    id: 2,
    username: "XxILoveCookiesxX",
    password: "cookiesarelife",
    email: "cookielover@cookiesarenice.com",
  },
  {
    id: 3,
    username: "NESUECA",
    password: "qwmeqwekqweqwmeqw",
    email: "niceemail@adknadja.com",
  },
];

const fakeProfiles = [
  {
    id: 1,
    user_id: 1,
    bio: "Hello, World!",
    date_joined: dateNow(),
  },
  {
    id: 2,
    user_id: 2,
    bio: "Hello, From Mars!",
    date_joined: dateNow(),
  },
  {
    id: 3,
    user_id: 3,
    bio: "Hello, From Saturn!",
    date_joined: dateNow(),
  },
];

const fakePosts = [
  {
    id: 1,
    author_id: 1,
    created_at: dateNow(),
    updated_at: dateNow(),
    title: "What Are Linear Maps?",
    content: "Suppose we have a function T: V -> W. If T satisfy additivity and homogeniety, then T is said to be a linear map.",
    published: true
  },
  {
    id: 2,
    author_id: 2,
    created_at: dateNow(),
    updated_at: dateNow(),
    title: "Why Are Cookies Awesome?",
    content: "Because they are!",
    published: false,
  },
  {
    id: 3,
    author_id: 3,
    created_at: dateNow(),
    updated_at: dateNow(),
    title: "Why Valorant Sucks?",
    content: "Because there are lazer beams, rockets, and dogs everywhere.",
    published: true,
  },
  {
    id: 4,
    author_id: 1,
    created_at: dateNow(),
    updated_at: dateNow(),
    title: "Eigenvalues",
    content: "Suppose T is a linear operator on V. A number lambda in F is called an eigenvalue of T if there exists v in V with v not equal to zero and Tv = lambda v.",
    published: true
  },
];

const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers["authorization"];
  console.log(bearerHeader);

  if (bearerHeader) {
    const token = bearerHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN, (err, authData) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden: Invalid or expired token." })
      }

      req.user = authData.data;
      next();
    });
  } else {
    return res.status(401).json({ message: "Unauthorized: No token provided." });
  }
};

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to BlogForge API!",
  });
});

app.get("/posts", (req, res) => {
  const result = {
    message: "Request Granted.",
    posts: [],
  };

  fakePosts.forEach(({ id, author_id, created_at, updated_at, title, content, published }) => {
    if (published) {
      result.posts.push({
        id,
        author: fakeUsers[author_id - 1].username,
        created_at,
        updated_at,
        title,
        content,
      });
    }
  });

  res.json(result);
});

app.post("/posts", verifyToken, (req, res) => {
  console.log(req.user)
  res.json({
    message: "Post Created.",
  });
});

app.get("/user/:id", (req, res) => {
  const userID  = parseInt(req.params.id);
  const user    = fakeUsers[userID];
  const profile = fakeProfiles[userID];
  const posts   = [];

  fakePosts.forEach(({ id, author_id, created_at, updated_at, title, content, published }) => {
    if (author_id === userID) {
      posts.push({
        id,
        created_at,
        updated_at,
        title,
        content,
      });
    }
  });
  
  const userIdentity = {
    username: user.username,
    bio: profile.bio,
    date_joined: profile.date_joined,
    posts,
  };

  res.json({
    message: "Request Granted.",
    user: userIdentity,
  });
});

const createAccessToken = (user) => {
  return jwt.sign({ user }, process.env.ACCESS_TOKEN, { expiresIn: '30s' });
};

app.post("/token", async (req, res, next) => {
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
});

app.delete("/sign-out", async (req, res, next) => {
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
});

app.post("/sign-up", async (req, res, next) => {
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
});

app.post("/sign-in", async (req, res, next) => {
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
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal Server Error: " + err.stack
  });
});

app.listen(3000, () => {
  console.log("Sevrer listening at port 3000");
});
