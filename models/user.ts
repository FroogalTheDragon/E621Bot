import { PathLike } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { User } from "../types/User.ts";
import { defaultBlacklist } from "../constants/strings.ts";
import { E621DatabaseError } from "../types/Error.ts";

/**
 * Insert a new user
 * @param user
 * @param dbFile
 * @returns StatementResultingChanges
 * @throws E621DatabaseError
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
    const message: string = `Failed to insert user: ${user.telegramId}: ${err}`;
    console.error(message);
    throw new E621DatabaseError(message);
  }
}

/**
 * Update an existing user
 * @param blacklist
 * @param dbFile
 * @returns StatementResultingChanges
 * @throws E621DatabaseError
 */
export function updateBlacklist(user: User, dbFile: PathLike) {
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
    throw new E621DatabaseError(`Failed to update user: ${err}`);
  }
}

/**
 * @param rating Rating the user picked
 * @param id Telegram Id of user
 * @param dbFile Path to DB file
 * @returns StatementResultingChanges
 * @throws E621DatabaseError
 */
export function updateRating(id: number, rating: string, dbFile: PathLike) {
  try {
    const db = new DatabaseSync(dbFile);
    const queryResult = db.prepare(
      `UPDATE OR FAIL user_db SET rating = ? WHERE telegram_id = ?;`,
    ).run(
      rating,
      id,
    );
    db.close();
    return queryResult;
  } catch (err) {
    console.error(
      `Failed to update rating for user ${id}: ${err}`,
    );
    throw new E621DatabaseError(
      `Failed to update rating for user ${id}: ${err}`,
    );
  }
}

/**
 * Delete a user from the db
 * @param telegramId Id attatched to blacklist
 * @param dbFile Path to database file
 * @returns StatementResultingChanges
 * @throws E621DatabaseError
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
    throw new E621DatabaseError(
      `Failed to delete user data for ${telegramId}: ${err}`,
    );
  }
}

/**
 * Grabs a user from the db by owner's telegram id
 * @param telegramId
 * @param dbFile
 * @returns User
 * @throws E621DatabaseError
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
        rating: String(queryResult.rating),
        blacklist: String(queryResult.blacklist).split(",") ||
          defaultBlacklist.split(","),
      };
    }
  } catch (err) {
    console.error(
      `Failed to retrieve user ${telegramId} by id: ${err}`,
    );
    throw new E621DatabaseError(
      `Failed to retrieve user ${telegramId} by id: ${err}`,
    );
  }
}

/**
 * Check if a user is in the database
 * @param telegramId who to check for in the database
 * @param dbFile What database to check
 * @returns boolean
 * @throws E621DatabaseError
 */
export function userExists(telegramId: number, dbFile: PathLike) {
  try {
    const blacklist = getUserByTelegramId(telegramId, dbFile);
    if (blacklist) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.error(`Failed to detect if user ${telegramId} exists: ${err}`);
    throw new E621DatabaseError(
      `Failed to detect if user ${telegramId} exists: ${err}`,
    );
  }
}
