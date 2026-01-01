import { PathLike } from "node:fs";
import { createUserDb } from "../migration.ts";

export function createDatabase(dbFile: PathLike): boolean {
  try {
    createUserDb(dbFile);
    return true;
  } catch (err) {
    console.error(`Failed to create Database: ${dbFile}: ${err}`);
    return false;
  }
}
