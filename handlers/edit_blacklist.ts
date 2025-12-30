import { Conversation } from "@grammyjs/conversations";
import { Context } from "grammy";
import { User } from "../types/Blacklist.ts";
import { getUserByTelegramId, updateUser } from "../models/user.ts";
import { DB_FILE } from "../constants/strings.ts";

/**
 * Walk user through editing their blacklist
 * @param conversation
 * @param ctx
 */
export async function edit_blacklist(conversation: Conversation, ctx: Context) {
  const user = getUserByTelegramId(ctx.from?.id!, DB_FILE);
  if (user) {
    await ctx.reply(user.blacklist.join("\n"));
  } else {
    await ctx.reply(`Failed to retrieve blacklist to copy.`);
    throw new Error(`Failed to retrieve blacklist to copy.`);
  }

  await ctx.reply(
    `Copy and paste the above message then you can edit it and send it back, or you can send a list of space or line seperated <b><u>VALID</u></b>

    <a href='https://e621.net/tags'>Here</a> is a list of valid e621 tags for reference there are a LOT of them.`,
    { parse_mode: "HTML" },
  );
  const blacklist = (await conversation.form.text()).split("\n");

  console.log(blacklist);

  const newUserData: User = {
    telegramId: ctx.from?.id!,
    blacklist: blacklist,
  };

  try {
    updateUser(newUserData, DB_FILE);
  } catch (err) {
    console.error(
      `Failed to save blacklist for ${ctx.from?.first_name} id ${ctx.from?.id}: ${err}`,
    );
  }

  const newBlacklist = getUserByTelegramId(ctx.from?.id!, DB_FILE);

  if (newBlacklist) {
    await ctx.reply(
      `Success!  Your new blacklist is:
<b>${newBlacklist.blacklist.join("\n")}</b>`,
      { parse_mode: "HTML" },
    );
  } else {
    console.error(`Failed to retrieve updated blacklist after update`);
    ctx.reply(
      "Failed to retrieve updated blacklist try running /blacklist to see your changes",
    );
  }
}
