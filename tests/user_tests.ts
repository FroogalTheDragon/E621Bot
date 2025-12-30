import { existsSync } from "node:fs";
import { TEST_DB_FILE } from "../constants/strings.ts";
import { createBlacklistDb } from "../db/migration.ts";
import {
  deleteUser,
  getUserByTelegramId as getUserByTelegramId,
  insertUser,
  updateUser,
  userExists,
} from "../models/user.ts";
import { User } from "../types/Blacklist.ts";
import { assertEquals } from "@std/assert/equals";
import { assertObjectMatch } from "@std/assert/object-match";

const testBlacklist: User = {
  id: 1,
  telegramId: 12345,
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
  createBlacklistDb(TEST_DB_FILE);

  const queryResult = insertUser(testBlacklist, TEST_DB_FILE);
  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 1);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testGetUserByTelegramId() {
  createBlacklistDb(TEST_DB_FILE);
  insertUser(testBlacklist, TEST_DB_FILE);

  const user = getUserByTelegramId(12345, TEST_DB_FILE);

  console.log(user);

  assertObjectMatch(user!, testBlacklist);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testUpdateUser() {
  createBlacklistDb(TEST_DB_FILE);
  insertUser(testBlacklist, TEST_DB_FILE);

  const updatedBlacklist = testBlacklist;

  updatedBlacklist.blacklist.push("test", "tags");

  const queryResult = updateUser(updatedBlacklist, TEST_DB_FILE);

  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 0);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testDeleteUser() {
  createBlacklistDb(TEST_DB_FILE);
  insertUser(testBlacklist, TEST_DB_FILE);

  const queryResult = deleteUser(testBlacklist.telegramId, TEST_DB_FILE);
  assertEquals(queryResult?.changes, 1);
  assertEquals(queryResult?.lastInsertRowid, 0);
  Deno.removeSync(TEST_DB_FILE);
});

Deno.test(function testUserExist() {
  createBlacklistDb(TEST_DB_FILE);
  insertUser(testBlacklist, TEST_DB_FILE);

  const result1 = userExists(12345, TEST_DB_FILE);
  assertEquals(result1, true);

  deleteUser(12345, TEST_DB_FILE);

  const result2 = userExists(12345, TEST_DB_FILE);
  assertEquals(result2, false);
  Deno.removeSync(TEST_DB_FILE);
});
