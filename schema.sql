DROP TABLE IF EXISTS movie;

CREATE TABLE IF NOT EXISTS movie (
    id SERIAL PRIMARY KEY,
    title VARCHAR(10000),
    release_date VARCHAR(10000),
    poster_path VARCHAR(10000),
    overview VARCHAR(10000),
    comment VARCHAR(10000)
);