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

const getAllPublishedPosts = async (user_id) => {
  const SQL = `
    SELECT
      bf_post.id,
      username as author,
      author_id,
      created_at,
      updated_at,
      title,
      (
        SELECT
          (COUNT (*))::INTEGER
        FROM bf_post_heart
        WHERE bf_post.id = bf_post_heart.post_id
      ) AS hearts,
      content
    FROM bf_post
    INNER JOIN
      bf_user
      ON bf_user.id = bf_post.author_id
    WHERE published = TRUE;
  `;

  const UserIDSQL = `
    SELECT
      bf_post.id,
      username as author,
      author_id,
      created_at,
      updated_at,
      title,
      (
        SELECT
          (COUNT (*))::INTEGER
        FROM bf_post_heart
        WHERE bf_post.id = bf_post_heart.post_id
      ) AS hearts,
      content
    FROM bf_post
    INNER JOIN
      bf_user
      ON bf_user.id = bf_post.author_id
    WHERE (published = TRUE) AND (author_id = $1);
  `;

  if (user_id) {
    const { rows } = await pool.query(UserIDSQL, [user_id]);
    return rows;
  } else {
    const { rows } = await pool.query(SQL);
    return rows;
  }
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

const addCommentToPost = async (post_id, user_id, content) => {
  const SQL = `
    INSERT INTO bf_comment (post_id, user_id, content)
    VALUES ($1, $2, $3)
    RETURNING id;
  `;

  const { rows } = await pool.query(SQL, [post_id, user_id, content]);

  return rows[0].id;
};

const getAllComments = async (post_id, user_id) => {
  // https://www.postgresql.org/docs/current/functions-conditional.html
  // https://www.w3schools.com/sql/sql_join_left.asp
  // SURELY WE CAN SIMPLIFY THIS! SQL PROS, PLEASE DONT LAUGH AT ME! I JUST STARTED LOL
  const SQL = `
    SELECT 
      c.id,
      u.username,
      c.content,
      (
        COALESCE((
          SELECT
            SUM(CASE WHEN like_value = 1 THEN 1 ELSE 0 END)::INTEGER
          FROM bf_comment_like WHERE comment_id = c.id
          ), 0)
      ) AS likes,
      (
        COALESCE((
          SELECT
            SUM(CASE WHEN like_value = -1 THEN 1 ELSE 0 END)::INTEGER
          FROM bf_comment_like WHERE comment_id = c.id
          ), 0)
      ) AS dislikes,
      (
        COALESCE((
        SELECT 
          CASE
            WHEN like_value = 1 THEN 'liked'
            WHEN like_value = -1 THEN 'disliked'
            ELSE 'none'
          END
        FROM bf_comment_like as cl
        WHERE cl.comment_id = c.id AND cl.user_id = $2
        ), 'none')
      ) AS user_reaction 
    FROM 
      bf_comment AS c
    JOIN 
      bf_user AS u ON c.user_id = u.id
    WHERE 
      c.post_id = $1
    GROUP BY 
      c.id, u.username
    ORDER BY 
      c.created_at DESC;
  `;

  const { rows } = await pool.query(SQL, [post_id, user_id]);
  return rows;
};

const toggleLikeDislike = async (comment_id, user_id, type) => {
  const SELECTSQL = `
    SELECT * FROM bf_comment_like
    WHERE (comment_id = $1) AND (user_id = $2);
  `;

  const selectResult = await pool.query(SELECTSQL, [comment_id, user_id]);
  if (selectResult.rows.length) {
    const UPDATESQL = `
      UPDATE bf_comment_like
      SET like_value = $3
      WHERE comment_id = $1 AND user_id = $2;
    `;

    let prevLikeValue = selectResult.rows[0].like_value;
    let likeValue = 0;
    if (type === "like") {
      likeValue = ((prevLikeValue === -1) || (prevLikeValue === 0)) ? 1 : 0;
    } else if (type === "dislike") {
      likeValue = ((prevLikeValue === 1) || (prevLikeValue === 0)) ? -1 : 0;
    }
    
    await pool.query(UPDATESQL, [comment_id, user_id, likeValue]);

    if (likeValue === 1) {
      return "liked";
    } else if (likeValue === -1) {
      return "disliked";
    } else {
      return "none";
    }
  } else {
    const INSERTSQL = `
      INSERT INTO bf_comment_like (comment_id, user_id, like_value)
      VALUES ($1, $2, $3);
    `;
    await pool.query(INSERTSQL, [comment_id, user_id, type === "like" ? 1 : ((type === "dislike") ? -1 : 0)]);

    return type + "d";
  }
};

const toggleHeart = async (post_id, user_id) => {
  // TODO: in the toggleLikeDislike, we should also delete when the like value is 0!
  const SELECTSQL = `
    SELECT * FROM bf_post_heart
    WHERE (post_id = $1) AND (user_id = $2);
  `;

  const selectResult = await pool.query(SELECTSQL, [post_id, user_id]);
  if (selectResult.rows.length) {
    const DELETESQL = `
      DELETE FROM bf_post_heart
      WHERE (post_id = $1) AND (user_id = $2);
    `;

    await pool.query(DELETESQL, [post_id, user_id]);
    return "none";
  } else {
    const INSERTSQL = `
      INSERT INTO bf_post_heart (user_id, post_id)
      VALUES ($1, $2);
    `;
    await pool.query(INSERTSQL, [user_id, post_id]);

    return "heart";
  }
};

const getPostStatistics = async (post_id, user_id) => {
  const USERHEARTSQL = `
    SELECT
      (CASE WHEN COUNT (*) = 1 THEN TRUE ELSE FALSE END)::BOOL as user_reaction
    FROM bf_post_heart
    WHERE (bf_post_heart.post_id = $1) AND (bf_post_heart.user_id = $2);
  `;

  const TOTALHEARTSSQL = `
    SELECT COUNT(*)::INTEGER AS hearts
      FROM bf_post_heart
    WHERE $1 = bf_post_heart.post_id;
  `;

  const TOTALVIEWSSQL = `
    SELECT COUNT(*)::INTEGER AS view_count
      FROM bf_post_view
    WHERE (bf_post_view.post_id = $1);
  `;

  const userResult = await pool.query(USERHEARTSQL, [post_id, user_id]);
  const heartsResult = await pool.query(TOTALHEARTSSQL, [post_id]);
  const viewResult = await pool.query(TOTALVIEWSSQL, [post_id]);
  return {
    heartedByUser: userResult.rows[0].user_reaction,
    heartCount: heartsResult.rows[0].hearts,
    viewCount: viewResult.rows[0].view_count,
  }
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
  addCommentToPost,
  getAllComments,
  toggleLikeDislike,
  toggleHeart,
  getPostStatistics,
};
