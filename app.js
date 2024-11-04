import express from "express";
const app = express();

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
  }
];

app.get("/", (req, res) => {
  res.json({
    status: 200,
    message: "Welcome to BlogForge API!",
  });
});

app.get("/posts", (req, res) => {
  const result = {
    status: 200,
    message: "Request Granted.",
    posts: []
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

app.get("/user/:id", (req, res) => {
  const userID  = parseInt(req.params.id);
  const user    = fakeUsers[userID];
  const profile = fakeProfiles[userID];
  
  const userIdentity = {
    username: user.username,
    bio: profile.bio,
    date_joined: profile.date_joined,
  };

  res.json({
    status: 200,
    message: "Request Granted.",
    user: userIdentity,
  });
});

app.get("/sign-in", (req, res) => {
});

app.listen(3000, () => {
  console.log("Sevrer listening at port 3000");
});
