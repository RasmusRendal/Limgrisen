-- Add up migration script here
CREATE TABLE IF NOT EXISTS ctfs (
       id INTEGER PRIMARY KEY,
       snowflake TEXT NOT NULL,
       name TEXT NOT NULL,
       is_archived INTEGER DEFAULT 0
);


CREATE TABLE IF NOT EXISTS challenges (
       id INTEGER PRIMARY KEY,
       snowflake TEXT NOT NULL,
       name TEXT NOT NULL,
       category TEXT NOT NULL,
       is_archived INTEGER DEFAULT 0,
       ctf_id INTEGER NOT NULL,
       FOREIGN KEY(ctf_id) REFERENCES ctfs(id)
);

CREATE TABLE IF NOT EXISTS config (
       id INTEGER PRIMARY KEY,
       option TEXT NOT NULL,
       value TEXT
);
