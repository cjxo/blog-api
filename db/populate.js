import pg from 'pg';
import 'dotenv/config';

const SQL = `
 DROP TABLE IF EXISTS bf_comment_like;
--  DROP TABLE IF EXISTS bf_comment;
--  DROP TABLE IF EXISTS bf_post;
--  DROP TABLE IF EXISTS bf_user_profile;
--  DROP TABLE IF EXISTS bf_per_user_refresh_token;
--  DROP TABLE IF EXISTS bf_user;

  CREATE TABLE IF NOT EXISTS bf_user (
    id          INTEGER        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    first_name  TEXT           UNIQUE NOT NULL,
    last_name   TEXT           NOT NULL,
    username    VARCHAR(64)    UNIQUE NOT NULL,
    email       VARCHAR(128)   UNIQUE NOT NULL,
    password    TEXT           NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bf_per_user_refresh_token (
    id        INTEGER        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id   INTEGER        UNIQUE REFERENCES bf_user(id) ON DELETE CASCADE,
    token     TEXT           NOT NULL,
    ref_cnt   INTEGER        DEFAULT(0)
  );

  CREATE TABLE IF NOT EXISTS bf_user_profile (
    id           INTEGER        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id      INTEGER        REFERENCES bf_user(id) ON DELETE CASCADE,
    bio          TEXT           DEFAULT(''),
    date_joined  TIMESTAMPTZ    DEFAULT(TIMEZONE('utc', NOW()))
  );

  CREATE TABLE IF NOT EXISTS bf_post (
    id          INTEGER      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    author_id   INTEGER      REFERENCES bf_user(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  DEFAULT(TIMEZONE('utc', NOW())),
    updated_at  TIMESTAMPTZ  DEFAULT(TIMEZONE('utc', NOW())),
    title       TEXT         NOT NULL,
    content     TEXT         NOT NULL,
    published   BOOLEAN      DEFAULT(false)
  );

  CREATE TABLE IF NOT EXISTS bf_comment (
    id          INTEGER      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    post_id     INTEGER      REFERENCES bf_post(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ  DEFAULT(TIMEZONE('utc', NOW())),
    user_id     INTEGER      REFERENCES bf_user(id) ON DELETE CASCADE, 
    content     TEXT         NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bf_comment_like (
    id          INTEGER      PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    comment_id  INTEGER      REFERENCES bf_comment(id) ON DELETE CASCADE,
    user_id     INTEGER      REFERENCES bf_user(id) ON DELETE CASCADE,
    like_value  INTEGER      NOT NULL CHECK (like_value IN(-1, 1)), -- if 1, then like, -1,
    UNIQUE (comment_id, user_id)
  );
`;

async function main() {
  const client = new pg.Client({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE
  });

  await client.connect();

  await client.query(SQL);

  await client.end();
}

main();
