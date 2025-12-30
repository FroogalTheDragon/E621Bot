import { PathLike } from "node:fs";
import { createBlacklistDb } from "../migration.ts";

export function createDatabase(dbFile: PathLike): boolean {
  try {
    createBlacklistDb(dbFile);
    return true;
  } catch (err) {
    console.error(`Failed to create Database: ${dbFile}: ${err}`);
    return false;
  }
}
