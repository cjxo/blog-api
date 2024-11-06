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

const welcome = (req, res) => {
  res.json({
    message: "Welcome to BlogForge API!",
  });
};

const getAllPosts = (req, res) => {
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
};

const createPost = (req, res) => {
  console.log(req.user)
  res.json({
    message: "Post Created.",
  });
};

const getUserDetails = (req, res) => {
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
};

export default {
  welcome,
  getAllPosts,
  createPost,
  getUserDetails,
};
