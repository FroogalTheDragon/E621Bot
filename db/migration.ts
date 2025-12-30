import { PathLike } from "node:fs";
import { DatabaseSync } from "node:sqlite";

export function createBlacklistDb(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);

    db.prepare(`
      CREATE TABLE IF NOT EXISTS user_db (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        telegram_id BIGINT NOT NULL UNIQUE,
        blacklist TEXT DEFAULT 'gore,scat,watersports,young,loli,shota' -- Default blacklist for every user on e621
      );
    `).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create blacklist db: ${err}`);
  }
}
