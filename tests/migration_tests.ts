import config from "../config.json" with { type: "json" };
import { assertEquals } from "@std/assert/equals";
import { DatabaseSync } from "node:sqlite";
import { createUserDb } from "../utils/db/migration.ts";
import { assertNotEquals } from "@std/assert/not-equals";
import { existsSync } from "node:fs";

const TEST_DB_DIR = `${Deno.cwd()}/${config.db.test}`;
const TEST_DB_FILE = `${Deno.cwd()}/${config.db.test_db_file}`;

if (!existsSync(TEST_DB_DIR)) {
  Deno.mkdir(TEST_DB_DIR, { recursive: true });
}
console.log(TEST_DB_FILE);
Deno.test(function testCreateBlacklistDb() {
  createUserDb(TEST_DB_FILE);

  // Get table
  const db = new DatabaseSync(TEST_DB_FILE);
  const table = db.prepare(
    `SELECT name FROM sqlite_master WHERE type ='table' AND name = 'user_db';`,
  ).get();
  db.close();

  assertNotEquals(table, undefined);
  assertEquals(table?.name, "user_db");
  Deno.removeSync(TEST_DB_FILE);
});
