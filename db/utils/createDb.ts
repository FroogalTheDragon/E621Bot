import { PathLike } from "node:fs";
import { createUserDb } from "../migration.ts";
import { E621DatabaseError } from "../../types/Error.ts";

export function createDatabase(dbFile: PathLike) {
  try {
    createUserDb(dbFile);
  } catch (err) {
    console.error(`Failed to create Database: ${dbFile}: ${err}`);
    throw new E621DatabaseError(`Failed to create Database: ${dbFile}: ${err}`);
  }
}
