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

export default {
  usernameOrEmailExists,
  createNewUserAndReturnID,
  getUserFromUsername,
  insertRefreshTokenToUser,
  userHasRefreshToken,
  deleteRefreshTokenFromUser,
};
