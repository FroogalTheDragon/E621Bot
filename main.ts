import { InlineQueryResult } from "grammy/types";
import { E621Bot } from "./models/E621Bot.ts";
import { InlineQueryResultBuilder } from "grammy";
import { E621RequestBuilder } from "./models/E621RequestBuilder.ts";
import * as numbers from "./constants/numbers.ts";
import * as urls from "./constants/urls.ts";
import * as strings from "./constants/strings.ts";

if (import.meta.main) {
  const yiffBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );

  yiffBot.command("start", async (ctx) =>
    await ctx.reply(
      strings.startString,
      { parse_mode: "HTML" },
    ));

  yiffBot.command("info", async (ctx) => {
    await ctx.reply(
      strings.infoString,
      { parse_mode: "HTML" },
    );
  });

  yiffBot.command("hits", async (ctx) => {
    await ctx.reply(`I have processed ${yiffBot.hits} queries.`);
  });

  yiffBot.command("help", async (ctx) => {
    await ctx.reply(strings.helpString, { parse_mode: "HTML" });
  });

  // INLINE QUERIES
  yiffBot.on("inline_query", async (ctx) => {
    yiffBot.hits++;
    console.log(yiffBot.hits);
    // Assume we will be getting pages of results
    let moreApiPages = true;
    const request = await yiffBot.parseInlineQuery(
      ctx.inlineQuery.query,
      new E621RequestBuilder(),
    );
    // Handle offset

    // Get the current offset from Telegram
    const currentTelegramOffset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset, 10)
      : 0;

    // Calculate the page number to pull from the API
    let apiPageToFetch =
      Math.floor(currentTelegramOffset / numbers.API_PAGE_SIZE) + 1;

    // Set our page number in the URL Builder
    request.page = apiPageToFetch;

    // The offset in the current batch of results
    const offsetInCurrentApiPage = currentTelegramOffset %
      numbers.API_PAGE_SIZE;

    // Create a array to hold the Inline Query Results
    const inlineQueryResults: Array<InlineQueryResult> = [];
    // console.log(request.page);
    while (
      inlineQueryResults.length <
        (numbers.IMAGE_LOAD_COUNT + offsetInCurrentApiPage) &&
      moreApiPages
    ) {
      if (ctx.inlineQuery.query.length === 0) request.order = urls.date.today;
      console.log(request.buildUrl());
      const yiffRequest = await yiffBot.sendRequest(request.buildUrl());
      const yiffJson = await yiffRequest.json();
      if (yiffJson.posts.length === 0) {
        moreApiPages = false;
        break;
      }

      // Looping through our posts
      posts_loop:
      for (const post in yiffJson.posts) {
        // Handle blacklisted tags and skip post if a blacklisted tag is detected

        // Loop through tag object and build an array to compare against set blacklisted tag
        const blacklistTagArray = [];
        for (const key in yiffJson.posts[post].tags) {
          if (yiffJson.posts[post].tags[key].length === 0) continue;
          for (let i = 0; i < yiffJson.posts[post].tags[key].length; i++) {
            blacklistTagArray.push(yiffJson.posts[post].tags[key][i]);
            if (
              yiffBot.buildBlacklistRegex()?.test(
                yiffJson.posts[post].tags[key][i],
              )
            ) {
              console.log("Blacklisted tag detected!");
              continue posts_loop; // Continue from posts_loop
            }
          }
        }

        // Check filetype and build InlineQueryResult of that type
        switch (yiffJson.posts[post].file.ext) {
          case (strings.fileTypes.jpg): {
            const result = InlineQueryResultBuilder.photo(
              String(yiffJson.posts[post].id),
              yiffJson.posts[post].file.url,
            );
            inlineQueryResults.push(result);
            break;
          }
          case (strings.fileTypes.png): {
            const result = InlineQueryResultBuilder.photo(
              String(yiffJson.posts[post].id),
              yiffJson.posts[post].file.url,
            );
            inlineQueryResults.push(result);
            break;
          }
          case (strings.fileTypes.gif): {
            const result = InlineQueryResultBuilder.gif(
              `${yiffJson.posts[post].id}`,
              yiffJson.posts[post].file.url,
              yiffJson.posts[post].preview.url,
            );
            inlineQueryResults.push(result);
            break;
          }
          case (strings.fileTypes.mp4): {
            const result =
              (yiffBot.calcMegabytes(yiffJson.posts[post].file.size) >
                  numbers.MAX_FILE_SIZE)
                ? InlineQueryResultBuilder.videoMp4(
                  `${yiffJson.posts[post].id}`,
                  `${yiffJson.posts[post].tags.artist[0]}`,
                  `${yiffJson.posts[post].file.url}`,
                  `${yiffJson.posts[post].preview.url}`,
                ).text(`${urls.baseUrl}/${yiffJson.posts[post].id}`)
                : InlineQueryResultBuilder.videoMp4(
                  `${yiffJson.posts[post].id}`,
                  `${yiffJson.posts[post].tags.artist[0]}`,
                  `${yiffJson.posts[post].file.url}`,
                  `${yiffJson.posts[post].preview.url}`,
                );
            inlineQueryResults.push(result);
            break;
          }
          case (strings.fileTypes.webm): {
            const result = InlineQueryResultBuilder.photo(
              `${yiffJson.posts[post].id}`,
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

      if (yiffJson.posts.length < numbers.API_PAGE_SIZE) {
        moreApiPages = false;
      } else {
        apiPageToFetch++;
      }
    }

    const currentResults = inlineQueryResults.slice(
      offsetInCurrentApiPage,
      offsetInCurrentApiPage + numbers.IMAGE_LOAD_COUNT,
    );

    let nextTelegramOffset = "";
    const totalRequestsInThisQuery = currentResults.length;

    const morePagesFound =
      totalRequestsInThisQuery === numbers.IMAGE_LOAD_COUNT &&
      (moreApiPages ||
        inlineQueryResults.length >
          (offsetInCurrentApiPage + numbers.IMAGE_LOAD_COUNT));

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
      cache_time: 0,
    });
  });

  yiffBot.catch(async (err) => {
    await console.log(`E621Bot Error: ${err.message} Fuck You!!`);
  });

  yiffBot.start();
}
