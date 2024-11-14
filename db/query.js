import bcrypt from "bcryptjs";
import pool from "./pool.js";

const checkUserFieldsExistence = async (firstName, username, email) => {
  const SQL = `
    SELECT * FROM bf_user
    WHERE (first_name = $1) OR (username = $2) OR (email = $3);
  `;

  const { rows } = await pool.query(SQL, [firstName, username, email]);
  if (rows.length === 0) {
    return { firstNameExists: false, usernameExists: false, emailExists: false };
  }

  const firstNameExists = rows.some(row => row.first_name === firstName);
  const usernameExists = rows.some(row => row.username === username);
  const emailExists = rows.some(row => row.email === email);
  return { firstNameExists, usernameExists, emailExists };
};

const createNewUserAndReturnID = async (firstName, lastName, username, email, password) => {
  const saltAndHash = await bcrypt.hash(password, 10);

  const SQL = `
    INSERT INTO bf_user (first_name, last_name, username, email, password)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id;
  `;

  const { rows } = await pool.query(SQL, [firstName, lastName, username, email, saltAndHash]);
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
    INSERT INTO bf_per_user_refresh_token (user_id, token, ref_cnt)
    VALUES ($1, $2, 1);
  `;

  await pool.query(SQL, [userID, token]);
};

const increaseTokenRefCount = async (userID) => {
  const SQL = `
    UPDATE bf_per_user_refresh_token
    SET ref_cnt = ref_cnt + 1
    WHERE user_id = $1;
  `;
  await pool.query(SQL, [userID]);
};

const getRefreshTokenFromUserID = async (userID) => {
  const SQL = `
    SELECT * FROM bf_per_user_refresh_token
    WHERE user_id = $1;
  `;

  const { rows } = await pool.query(SQL, [userID]);
  if (rows.length > 0) {
    return rows[0].token;
  } else {
    return null;
  }
};

const deleteRefreshTokenFromUser = async (userID) => {
  const SQL = `
    UPDATE bf_per_user_refresh_token
    SET ref_cnt = GREATEST(ref_cnt - 1, 0)
    WHERE user_id = $1; 
  `;

  await pool.query(SQL, [userID]);

  const DELETESQL = `
    DELETE FROM bf_per_user_refresh_token
    WHERE ref_cnt <= 0;
  `;
  
  await pool.query(DELETESQL);
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
  checkUserFieldsExistence,
  createNewUserAndReturnID,
  getUserFromUsername,
  insertRefreshTokenToUser,
  increaseTokenRefCount,
  getRefreshTokenFromUserID,
  deleteRefreshTokenFromUser,
  createUserPost,
  getAllPublishedPosts,
  getUserDetails,
};
