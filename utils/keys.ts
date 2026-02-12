import { existsSync, PathLike } from "node:fs";
import { E621BotError } from "../types/Error.ts";
import { Keys } from "../interfaces.ts";

/**
 * @param keyFilePath
 */
export function loadKeys(keyFilePath: PathLike) {
  const keys: Keys = {
    keys: {
      bot: undefined,
      e621: undefined,
    },
  };
  if (!existsSync(keyFilePath)) {
    try {
      keys.keys.bot = Deno.env.get("TELEGRAM_BOT_KEY");
    } catch (err) {
      throw new E621BotError(
        `Failed to load API keys from: ${keyFilePath}: ${err}`,
      );
    }
  }
  const keyFile = Deno.openSync(keyFilePath.toString());

  console.log(keyFile);
}
