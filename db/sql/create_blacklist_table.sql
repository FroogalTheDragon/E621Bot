CREATE TABLE IF NOT EXISTS user_db (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id BIGINT NOT NULL UNIQUE,
    blacklist TEXT DEFAULT 'gore,scat,watersports,young,loli,shota' -- Default blacklist for every user on e621
);