import { InlineQueryResult } from "grammy/types";
import { E621Bot } from "./models/E621Bot.ts";
import { InlineQueryResultBuilder } from "grammy";
import { E621UrlBuilderPosts } from "./models/E621UrlBuilderPosts.ts";
import * as numbers from "./constants/numbers.ts";
import * as urls from "./constants/urls.ts";
import * as strings from "./constants/strings.ts";
import { E621UrlBuilderPools } from "./models/E621RequestBuilderPools.ts";
import { Api } from "grammy";

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

  /**
   * Search for pools
   */
  yiffBot.inlineQuery(/sp */, async (ctx) => {
    const currentTelegramOffset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset, 10)
      : 0;
    console.log(currentTelegramOffset);

    const urlBuilder = yiffBot.parseInlineQueryPools(
      ctx.inlineQuery.query,
      new E621UrlBuilderPools(),
    );
    const postUrlBuilder = new E621UrlBuilderPosts();
    console.log(urlBuilder);

    const poolRequest = await yiffBot.sendRequest(urlBuilder.buildUrl());
    const poolJson = await poolRequest.json();

    const poolInlineQueryResults: Array<InlineQueryResult> = [];
    for (const pool in poolJson) {
      postUrlBuilder.tags = [`id:${poolJson[pool].post_ids[0]}`];
      const thumbnailPostRequest = await yiffBot.sendRequest(
        postUrlBuilder.buildUrl(),
      );
      const thumbnailPostJson = await thumbnailPostRequest.json();
      const thumbnailUrl = thumbnailPostJson.posts[0].preview.url;
      console.log(thumbnailUrl);
      const result = InlineQueryResultBuilder.article(
        String(poolJson[pool].id),
        poolJson[pool].name,
        { thumbnail_url: thumbnailPostJson.posts[0].preview.url },
      ).text(`${urls.baseUrl}${urls.endpoint.pools}/${poolJson[pool].id}`);
      // console.log(result);
      poolInlineQueryResults.push(result);
    }

    // Calculate next offset
    const newOffset = currentTelegramOffset + numbers.POOLS_INLINE_LOAD_COUNT;

    let poolSlice: Array<InlineQueryResult> = [];
    if (currentTelegramOffset < poolInlineQueryResults.length) {
      poolSlice = poolInlineQueryResults.slice(
        currentTelegramOffset,
        newOffset,
      );
    }

    console.log();
    await ctx.answerInlineQuery(poolSlice, {
      cache_time: 300,
      next_offset: String(newOffset),
    });
  });

  yiffBot.on("chosen_inline_result", async (ctx) => {
    console.log(ctx.chosenInlineResult);
    await yiffBot.api.sendMessage(ctx.chosenInlineResult.from.id, `I'm watching you ${ctx.chosenInlineResult.from.username} and your little dog too ${urls.baseUrl}${urls.endpoint.posts}/${ctx.chosenInlineResult.result_id}`);
  })

  /**
   * Handle general searches
   */
  yiffBot.on("inline_query", async (ctx) => {
    // Stop processing if user types in "pools search"
    // if (ctx.inlineQuery.query === "pools search") return;
    if (/sp */.test(ctx.inlineQuery.query)) return;
    // Increase the hit counter
    yiffBot.hits++;

    // Get the current offset from Telegram
    const currentTelegramOffset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset, 10)
      : 0;

    // Set blacklist back to zero after every call
    yiffBot.blacklistedResults = 0;
    console.log(yiffBot.hits);

    // Assume we will be getting pages of results
    let moreApiPages = true;

    // Parse the inline query and create a new URL builder object based on the query
    const request = yiffBot.parseInlineQuery(
      ctx.inlineQuery.query,
      new E621UrlBuilderPosts(),
    );

    // Calculate the page number to pull from the API
    let apiPageToFetch =
      Math.floor(currentTelegramOffset / numbers.API_PAGE_SIZE) + 1;
    console.log(`Page: ${apiPageToFetch}`);

    // Set our page number in the URL Builder
    request.page = apiPageToFetch;

    if (ctx.inlineQuery.query.length === 0) request.order = urls.date.today;
    yiffBot.currentBatchOfResults = await yiffBot.sendRequest(
      request.buildUrl(),
    );
    const yiffJson = await yiffBot.currentBatchOfResults?.json();
    console.log(request.buildUrl());
    // Handle offset

    // The offset in the current batch of results
    const offsetInCurrentApiPage = currentTelegramOffset %
      numbers.API_PAGE_SIZE;

    // Create a array to hold the Inline Query Results
    const inlineQueryResults: Array<InlineQueryResult> = [];
    // console.log(request.page);

    while (
      inlineQueryResults.length <
        (numbers.IMAGE_LOAD_COUNT + offsetInCurrentApiPage) &&
      moreApiPages && yiffBot.blacklistedResults <= numbers.BLACKLIST_MAX_HITS
    ) {
      // Check if this request contains data, if it's empty then we have reached the end
      if (yiffJson.posts.length === 0) {
        moreApiPages = false;
        console.log("END OF RESULTS!");
        break;
      } else {
        apiPageToFetch++;
      }

      // Looping through our posts
      posts_loop:
      for (const post in yiffJson.posts) {
        // Handle blacklisted tags and skip post if a blacklisted tag is detected

        // Loop through tag object and build an array to compare against set blacklisted tag
        for (const key in yiffJson.posts[post].tags) {
          if (yiffJson.posts[post].tags[key].length === 0) continue;
          for (let i = 0; i < yiffJson.posts[post].tags[key].length; i++) {
            // blacklistTagArray.push(yiffJson.posts[post].tags[key][i]);
            if (
              yiffBot.buildBlacklistRegex()?.test(
                yiffJson.posts[post].tags[key][i],
              )
            ) {
              // console.log("Blacklisted tag detected!");
              yiffBot.blacklistedResults++;
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
            console.log(
              `Mp4 File Size: ${
                yiffBot.calcMegabytes(yiffJson.posts[post].file.size)
              }`,
            );
            const result =
              (yiffBot.calcMegabytes(yiffJson.posts[post].file.size) >
                  numbers.MAX_FILE_SIZE)
                ? InlineQueryResultBuilder.videoMp4(
                  `${yiffJson.posts[post].id}`,
                  `${yiffJson.posts[post].tags.artist[0]}`,
                  `${yiffJson.posts[post].file.url}`,
                  `${yiffJson.posts[post].preview.url}`,
                ).text(
                  `${urls.baseUrl}${urls.endpoint.posts}/${
                    yiffJson.posts[post].id
                  }`,
                )
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
            ).text(
              `${urls.baseUrl}${urls.endpoint.posts}/${
                yiffJson.posts[post].id
              }`,
            );
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
    }

    // This should slice from the stored state in yiffBot instead of these inline query results.
    const currentResults = inlineQueryResults.slice(
      offsetInCurrentApiPage,
      offsetInCurrentApiPage + numbers.IMAGE_LOAD_COUNT,
    );

    const totalRequestsInThisQuery = currentResults.length;

    const morePagesFound =
      totalRequestsInThisQuery === numbers.IMAGE_LOAD_COUNT &&
      (moreApiPages ||
        inlineQueryResults.length >
          (offsetInCurrentApiPage + numbers.IMAGE_LOAD_COUNT));

    let nextTelegramOffset = "";
    if (morePagesFound) {
      nextTelegramOffset = String(
        // Add the length of the slice we took from the results to the offset
        currentTelegramOffset + numbers.IMAGE_LOAD_COUNT,
      );
    }

    console.log(nextTelegramOffset);
    await ctx.answerInlineQuery(currentResults, {
      next_offset: nextTelegramOffset,
      is_personal: true,
      cache_time: 300,
    });
  });

  yiffBot.catch(async (err) => {
    await console.log(`E621Bot Error: ${err.message} Fuck You!!`);
  });

  yiffBot.start();
}
