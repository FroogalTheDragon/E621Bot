import { InlineQueryResult } from "grammy/types";
import { E621Bot } from "./models/E621Bot.ts";
import { InlineQueryResultBuilder } from "grammy";
import { helpString, infoString, startString } from "./constants/strings.ts";
import { E621RequestBuilder } from "./models/E621RequestBuilder.ts";
import { API_PAGE_SIZE, IMAGE_LOAD_COUNT } from "./constants/numbers.ts";
import * as urls from "./constants/urls.ts";

if (import.meta.main) {
  const yiffBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );

  yiffBot.command("start", async (ctx) =>
    await ctx.reply(
      startString,
      { parse_mode: "HTML" },
    ));

  yiffBot.command("info", async (ctx) => {
    await ctx.reply(
      infoString,
      { parse_mode: "HTML" },
    );
  });

  yiffBot.command("help", async (ctx) => {
    await ctx.reply(helpString, { parse_mode: "HTML" });
  });

  // INLINE QUERIES
  yiffBot.on("inline_query", async (ctx) => {
    const request = await yiffBot.parseInlineQuery(
      ctx.inlineQuery.query,
      new E621RequestBuilder(),
    );

    // Handle offset here?
    const currentTelegramOffset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset, 10)
      : 0;
    let apiPageToFetch = Math.floor(currentTelegramOffset / API_PAGE_SIZE) + 1;
    const offsetInCurrentApiPage = currentTelegramOffset % API_PAGE_SIZE;
    request.page = apiPageToFetch;
    const inlineQueryResults: Array<InlineQueryResult> = [];
    let moreApiPages = true;
    console.log(request.page);
    while (
      inlineQueryResults.length < (IMAGE_LOAD_COUNT + offsetInCurrentApiPage) &&
      moreApiPages
    ) {
      if (ctx.inlineQuery.query.length === 0) request.order = urls.order.hot;
      const yiffRequest = await yiffBot.sendRequest(request.buildUrl());
      console.log(request.buildUrl());
      const yiffJson = await yiffRequest.json();
      if (yiffJson.posts.length === 0) {
        moreApiPages = false;
        break;
      }
      for (const post in yiffJson.posts) {
        switch (yiffJson.posts[post].file.ext) {
          case ("jpg"): {
            const result = InlineQueryResultBuilder.photo(
              String(yiffJson.posts[post].id),
              yiffJson.posts[post].file.url,
            );
            inlineQueryResults.push(result);
            break;
          }
          case ("png"): {
            const result = InlineQueryResultBuilder.photo(
              String(yiffJson.posts[post].id),
              yiffJson.posts[post].file.url,
            );
            inlineQueryResults.push(result);
            break;
          }
          case ("gif"): {
            const result = InlineQueryResultBuilder.gif(
              `${yiffJson.posts[post].id}`,
              yiffJson.posts[post].file.url,
              yiffJson.posts[post].preview.url,
            );
            inlineQueryResults.push(result);
            break;
          }
          case ("mp4"): {
            const result = InlineQueryResultBuilder.videoMp4(
              `${yiffJson.posts[post].id}`,
              `${yiffJson.posts[post].tags.artist[0]}`,
              `${yiffJson.posts[post].file.url}`,
              `${yiffJson.posts[post].preview.url}`,
            ).text(`${urls.baseUrl}/${yiffJson.posts[post].id}`);
            inlineQueryResults.push(result);
            break;
          }
          case ("webm"): {
            const result = InlineQueryResultBuilder.videoMp4(
              `${yiffJson.posts[post].id}`,
              `${yiffJson.posts[post].tags.artist[0]}`,
              `${yiffJson.posts[post].file.url}`,
              `${yiffJson.posts[post].preview.url}`,
            ).text(`${urls.baseUrl}/${yiffJson.posts[post].id}`);
            inlineQueryResults.push(result);
            break;
          }
          default: {
            console.log(
              `Unknown File Extension: ${yiffJson.posts[post].file.ext}`,
            );
          }
        }
      }

      if (yiffJson.posts.length < API_PAGE_SIZE) {
        moreApiPages = false;
      } else {
        apiPageToFetch++;
      }
    }

    const currentResults = inlineQueryResults.slice(
      offsetInCurrentApiPage,
      offsetInCurrentApiPage + IMAGE_LOAD_COUNT,
    );

    let nextTelegramOffset = "";
    const totalRequestsInThisQuery = currentResults.length;

    const morePagesFound = totalRequestsInThisQuery === IMAGE_LOAD_COUNT &&
      (moreApiPages ||
        inlineQueryResults.length >
          (offsetInCurrentApiPage + IMAGE_LOAD_COUNT));

    if (morePagesFound) {
      nextTelegramOffset = String(
        currentTelegramOffset + totalRequestsInThisQuery,
      );
    } else {
      nextTelegramOffset = "";
    }
    console.log(nextTelegramOffset);
    await ctx.answerInlineQuery(currentResults, {
      next_offset: nextTelegramOffset,
      is_personal: true,
    });
    setTimeout(() => {}, 1000);
  });

  yiffBot.catch(async (err) => {
    await console.log(`E621Bot Error: ${err.message} Fuck You!!`);
  });

  yiffBot.start();
}
