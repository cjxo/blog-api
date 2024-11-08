import pg from 'pg';
import 'dotenv/config';

const SQL = `
  -- DROP TABLE IF EXISTS bf_comment;
  -- DROP TABLE IF EXISTS bf_post;
  -- DROP TABLE IF EXISTS bf_user_profile;
  -- DROP TABLE IF EXISTS bf_user;

  CREATE TABLE IF NOT EXISTS bf_user (
    id        INTEGER        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username  VARCHAR(64)    UNIQUE NOT NULL,
    password  TEXT           NOT NULL,
    email     VARCHAR(128)   UNIQUE NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bf_per_user_refresh_token (
    id        INTEGER        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id   INTEGER        REFERENCES bf_user(id) ON DELETE CASCADE,
    token     TEXT           NOT NULL
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
    username    VARCHAR(64)  NOT NULL,
    content     TEXT         NOT NULL
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
