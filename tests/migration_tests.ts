import { assertEquals } from "@std/assert/equals";
import { DatabaseSync } from "node:sqlite";
import { createBlacklistDb } from "../db/migration.ts";
import { assertNotEquals } from "@std/assert/not-equals";
import { TEST_DB_FILE } from "../constants/strings.ts";
import { existsSync } from "node:fs";

if (!existsSync("db/test_db")) {
  Deno.mkdir("db/test_db", { recursive: true });
}

Deno.test(function testCreateBlacklistDb() {
  createBlacklistDb(TEST_DB_FILE);

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
