import { PathLike } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { User } from "../types/Blacklist.ts";
import { defaultBlacklist } from "../constants/strings.ts";

/**
 * Insert a new user
 * @param user
 * @param dbFile
 * @returns StatementResultingChanges
 */
export function insertUser(user: User, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const queryResult = db.prepare(
      `INSERT INTO user_db (telegram_id) VALUES (?);`,
    ).run(
      user.telegramId,
    );
    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to insert user: ${err}`);
    throw err;
  }
}

/**
 * Update an existing user
 * @param blacklist
 * @param dbFile
 * @returns StatementResultingChanges
 */
export function updateUser(user: User, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const queryResult = db.prepare(
      `UPDATE OR FAIL user_db SET blacklist = ? WHERE telegram_id = ${user.telegramId};`,
    ).run(
      user.blacklist.join(","),
    );
    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to update user: ${err}`);
    throw err;
  }
}

/**
 * Delete a user from the db
 * @param telegramId Id attatched to blacklist
 * @param dbFile Path to database file
 * @returns StatementResultingChanges
 */
export function deleteUser(telegramId: number, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const queryResult = db.prepare(
      `DELETE FROM user_db WHERE telegram_id = ${telegramId};`,
    ).run();
    db.close();
    return queryResult;
  } catch (err) {
    console.error(`Failed to delete user data for ${telegramId}: ${err}`);
    throw err;
  }
}

/**
 * Grabs a user from the db by owner's telegram id
 * @param telegramId
 * @param dbFile
 * @returns Blacklist
 */
export function getUserByTelegramId(
  telegramId: number,
  dbFile: PathLike,
): User | undefined {
  try {
    const db = new DatabaseSync(dbFile);
    const queryResult = db.prepare(
      `SELECT * FROM user_db WHERE telegram_id = ${telegramId};`,
    ).get();
    db.close();

    console.log(queryResult);

    if (queryResult) {
      return {
        id: Number(queryResult.id),
        telegramId: Number(queryResult.telegram_id),
        blacklist: String(queryResult.blacklist).split(",") ||
          defaultBlacklist.split(","),
      };
    }
  } catch (err) {
    console.error(
      `Failed to retrieve user ${telegramId}: ${err}`,
    );
    throw err;
  }
}

export function userExists(telegramId: number, dbFile: PathLike) {
  try {
    const blacklist = getUserByTelegramId(telegramId, dbFile);
    if (blacklist) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(
      `Failed to qery the database for user: ${telegramId}: ${err}`,
    );
  }
}
