-- Add up migration script here
CREATE TABLE IF NOT EXISTS ctfs (
       id INTEGER PRIMARY KEY,
       snowflake TEXT NOT NULL,
       name TEXT NOT NULL
);


CREATE TABLE IF NOT EXISTS challenges (
       id INTEGER PRIMARY KEY,
       snowflake TEXT NOT NULL,
       name TEXT NOT NULL,
       category TEXT NOT NULL,
       ctf_id INTEGER,
       FOREIGN KEY(ctf_id) REFERENCES ctfs(id)
);

CREATE TABLE IF NOT EXISTS config (
       id INTEGER PRIMARY KEY,
       option TEXT NOT NULL,
       value TEXT
);
