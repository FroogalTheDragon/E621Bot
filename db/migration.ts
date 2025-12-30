import { PathLike } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { SQL_BASEPATH } from "../constants/strings.ts";

export function createBlacklistDb(dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const query = Deno.readTextFileSync(
      `${SQL_BASEPATH}/create_blacklist_table.sql`,
    ).trim();

    db.prepare(query).run();
    db.close();
  } catch (err) {
    console.error(`Failed to create blacklist db: ${err}`);
  }
}
