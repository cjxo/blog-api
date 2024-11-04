import pg from 'pg';
import 'dotenv/config';

const SQL = `
  CREATE TABLE IF NOT EXISTS bf_user (
    id        INTEGER        PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    username  VARCHAR(64)    UNIQUE NOT NULL,
    password  TEXT           NOT NULL,
    email     VARCHAR(128)   UNIQUE NOT NULL
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

  -- In our app, user do not need to be logged in, since this is only a 
  -- test APP!
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
