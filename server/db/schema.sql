DROP TABLE IF EXISTS cohorts;
DROP TABLE IF EXISTS cocktail_ingredients;
DROP TABLE IF EXISTS cocktails;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS visibilities;
DROP TABLE IF EXISTS glasses;
DROP TABLE IF EXISTS methods;

CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT,
    salt TEXT,
    hash TEXT,
    visibility TEXT DEFAULT 'HIDDEN',
    FOREIGN KEY (visibility) REFERENCES visibilities(visibility)
);

CREATE TABLE visibilities (visibility TEXT PRIMARY KEY);
INSERT INTO visibilities VALUES
    ('PUBLIC'),
    ('HIDDEN'),
    ('PRIVATE');

CREATE TABLE glasses (glass TEXT PRIMARY KEY);
INSERT INTO glasses VALUES
    ('coupe'),
    ('double old fashioned'),
    ('flute'),
    ('hurricane'),
    ('other');

CREATE TABLE methods (method TEXT PRIMARY KEY);
INSERT INTO methods VALUES
    ('shaken'),
    ('stirred'),
    ('flash blended'),
    ('built');

CREATE TABLE cocktails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    glass TEXT,
    method TEXT,
    garnish TEXT,
    source TEXT,
    info TEXT,
    owner INTEGER,
    FOREIGN KEY (glass) REFERENCES glasses(glass),
    FOREIGN KEY (method) REFERENCES methods(method),
    FOREIGN KEY (owner) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cocktail_ingredients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cocktail_id INTEGER,
    name TEXT,
    amount TEXT,
    FOREIGN KEY (cocktail_id) REFERENCES cocktails (id) ON DELETE CASCADE
);

CREATE TABLE cohorts (
    user INTEGER,
    cohort INTEGER,
    included BOOLEAN,
    FOREIGN KEY (user) REFERENCES users(id) ON DELETE CASCADE
    FOREIGN KEY (cohort) REFERENCES users(id) ON DELETE CASCADE
);