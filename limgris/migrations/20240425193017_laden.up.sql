-- Add up migration script here
CREATE TABLE IF NOT EXISTS ctfs (
       id INTEGER PRIMARY KEY,
       channel_snowflake TEXT NOT NULL,
       ctf_name TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS challenges (
       id INTEGER PRIMARY KEY,
       challenge_snowflake TEXT NOT NULL,
       challenge_name TEXT NOT NULL,
       challenge_category TEXT NOT NULL,
       ctf_id INTEGER,
       FOREIGN KEY(ctf_id) REFERENCES ctfs(id)
);

