import bcrypt from "bcryptjs";
import pool from "./pool.js";

const usernameOrEmailExists = async (user, email) => {
  const SQL = `
    SELECT * FROM bf_user
    WHERE (username = $1) OR (email = $2);
  `;

  const { rows } = await pool.query(SQL, [user, email]);
  if (rows.length === 0) {
    return { usernameExists: false, emailExists: false };
  }

  const usernameExists = rows.some(row => row.username === user);
  const emailExists = rows.some(row => row.email === email);
  return { usernameExists, emailExists };
};

const createNewUserAndReturnID = async (user, password, email) => {
  const saltAndHash = await bcrypt.hash(password, 10);

  const SQL = `
    INSERT INTO bf_user (username, password, email)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;

  const { rows } = await pool.query(SQL, [user, saltAndHash, email]);
  return rows[0].id;
};

const getUserFromUsername = async (username) => {
  const SQL = `
    SELECT * FROM bf_user
    WHERE username = $1;
  `;

  const { rows } = await pool.query(SQL, [username]);
  return rows[0];
};

const insertRefreshTokenToUser = async (userID, token) => {
  const SQL = `
    INSERT INTO bf_per_user_refresh_token (user_id, token)
    VALUES ($1, $2);
  `;

  await pool.query(SQL, [userID, token]);
};

const userHasRefreshToken = async (userID, token) => {
  const SQL = `
    SELECT * FROM bf_per_user_refresh_token
    WHERE (user_id = $1) AND (token = $2);
  `;

  const { rows } = await pool.query(SQL, [userID, token]);
  return rows.length > 0;
};

const deleteRefreshTokenFromUser = async (userID, token) => {
  const SQL = `
    DELETE FROM bf_per_user_refresh_token
    WHERE (user_id = $1) AND (token = $2);
  `;

  await pool.query(SQL, [userID, token]);
};

const createUserPost = async (userID, title, content, published) => {
  const SQL = `
    INSERT INTO bf_post (author_id, title, content, published)
    VALUES ($1, $2, $3, $4);
  `;

  await pool.query(SQL, [userID, title, content, published]);
};

const getAllPublishedPosts = async () => {
  const SQL = `
    SELECT bf_post.id, username as author, author_id, created_at, updated_at, title, content
    FROM bf_post
    INNER JOIN bf_user
    ON bf_user.id = bf_post.author_id
    WHERE published = TRUE;
  `;

  const { rows } = await pool.query(SQL);
  return rows;
};

const getUserPublishedPosts = async (userID) => {
  const SQL = `
    SELECT bf_post.id, username as author, author_id, created_at, updated_at, title, content
    FROM bf_post
    INNER JOIN bf_user
    ON bf_user.id = bf_post.author_id
    WHERE (published = TRUE) AND (bf_user.id = $1);
  `;

  const { rows } = await pool.query(SQL, [userID]);
  return rows;
};

const getUserDetails = async (userID) => {
  const SQLProfile = `
    SELECT bf_user.id, username, bio, date_joined
    FROM bf_user_profile
    INNER JOIN bf_user
    ON bf_user.id = bf_user_profile.user_id
    WHERE bf_user.id = $1;
  `;
  
  const { rows } = await pool.query(SQLProfile, [userID]);
  const posts = await getUserPublishedPosts(userID);
  return {
    ...rows[0],
    posts: posts
  };
};

export default {
  usernameOrEmailExists,
  createNewUserAndReturnID,
  getUserFromUsername,
  insertRefreshTokenToUser,
  userHasRefreshToken,
  deleteRefreshTokenFromUser,
  createUserPost,
  getAllPublishedPosts,
  getUserDetails,
};
