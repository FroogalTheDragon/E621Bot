import { existsSync } from "node:fs";
import { createUserDb } from "../utils/db/migration.ts";
import {
  deleteUser,
  getUserByTelegramId as getUserByTelegramId,
  insertUser,
  updateBlacklist,
  updateRating,
  userExists,
} from "../models/user.ts";
import { User } from "../types/User.ts";
import { assertEquals } from "@std/assert/equals";
import { assertObjectMatch } from "@std/assert/object-match";
import config from "../bot_config.json" with { type: "json" };

const TEST_DB_DIR = `${Deno.cwd()}/${config.db.test}`;
const TEST_DB_FILE = `${Deno.cwd()}/${config.db.test_db_file}`;

if (!existsSync(TEST_DB_DIR)) {
  Deno.mkdirSync(TEST_DB_DIR);
}

const testUser: User = {
  id: 1,
  telegramId: 12345,
  rating: "rating%3Asafe",
  blacklist: [
    "gore",
    "scat",
    "watersports",
    "young",
    "loli",
    "shota",
  ], // Default tags
};

if (!existsSync("db/test_db")) {
  Deno.mkdir("db/test_db", { recursive: true });
}

Deno.test(function testInsertBlacklist() {
  createUserDb(TEST_DB_FILE);

  const queryResult = insertUser(testUser, TEST_DB_FILE);
  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 1);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testGetUserByTelegramId() {
  createUserDb(TEST_DB_FILE);
  insertUser(testUser, TEST_DB_FILE);

  const user = getUserByTelegramId(12345, TEST_DB_FILE);
  console.log(user);
  assertObjectMatch(user!, testUser);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testUpdateRating() {
  createUserDb(TEST_DB_FILE);
  insertUser(testUser, TEST_DB_FILE);

  const updatedUser = testUser;
  updatedUser.rating = "e";

  const queryResults = updateRating(12345, "e", TEST_DB_FILE);
  assertEquals(queryResults.changes, 1);
  assertEquals(queryResults.lastInsertRowid, 0);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testUpdateUser() {
  createUserDb(TEST_DB_FILE);
  insertUser(testUser, TEST_DB_FILE);

  const updatedBlacklist = testUser;

  updatedBlacklist.blacklist.push("test", "tags");

  const queryResult = updateBlacklist(updatedBlacklist, TEST_DB_FILE);

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 0);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testDeleteUser() {
  createUserDb(TEST_DB_FILE);
  insertUser(testUser, TEST_DB_FILE);

  const queryResult = deleteUser(testUser.telegramId, TEST_DB_FILE);
  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 0);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testUserExist() {
  createUserDb(TEST_DB_FILE);
  insertUser(testUser, TEST_DB_FILE);

  const result1 = userExists(12345, TEST_DB_FILE);
  assertEquals(result1, true);

  deleteUser(12345, TEST_DB_FILE);

  const result2 = userExists(12345, TEST_DB_FILE);
  assertEquals(result2, false);
  Deno.removeSync(TEST_DB_FILE);
});
