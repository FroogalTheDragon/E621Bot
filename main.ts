import { InlineQueryResult } from "grammy/types";
import { E621Bot } from "./models/E621Bot.ts";
import { InlineQueryResultBuilder } from "grammy";
import { E621UrlBuilderPosts } from "./models/E621UrlBuilderPosts.ts";
import * as numbers from "./constants/numbers.ts";
import * as urls from "./constants/urls.ts";
import * as strings from "./constants/strings.ts";
import { E621UrlBuilderPools } from "./models/E621RequestBuilderPools.ts";

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
  yiffBot.inlineQuery(/search pools */, async (ctx) => {
    console.log("Searching Pools!");

    const queries = ctx.inlineQuery.query.replace("pools search ", "").split(
      " ",
    );

    const urlBuilder = new E621UrlBuilderPools();

    for (let i = 0; i < queries.length; i++) {
      const query = i + 1;
      switch (queries[i]) {
        case "id": {
          console.log("Pool Id query");
          urlBuilder.search = urls.poolSearch.id;
          urlBuilder.query = queries[i + 1];
          console.log(urlBuilder.query);
          break;
        }
        case "description": {
          console.log(`Description query`);
          urlBuilder.search = urls.poolSearch.descriptionMatches;
          urlBuilder.query = queries[query];
          break;
        }
        case "creator": {
          // Process sub command
          switch (queries[query]) {
            case "id": {
              const cidQuery = queries[query + 1]; // creator id query
              const searchType = urls.poolSearch.creatorId;

              urlBuilder.query = cidQuery;
              urlBuilder.search = searchType;
              console.log(`Creator Id`);
              break;
            }
            case "name": {
              const cnmQuery = queries[query + 1]; // creator name query
              const searchType = urls.poolSearch.creatorName;

              urlBuilder.query = cnmQuery;
              urlBuilder.search = searchType;
              break;
            }
          }
          break;
        }
        case "active": {
          urlBuilder.query = "true";
          urlBuilder.search = urls.poolSearch.isActive;
          break;
        }
        case "inactive": {
          urlBuilder.query = "false";
          urlBuilder.search = urls.poolSearch.isActive;
          break;
        }
        case "category": {
          const catQuery = queries[query + 1];
          const searchType = urls.poolSearch.category;

          urlBuilder.query = catQuery;
          urlBuilder.search = searchType;
          break;
        }
        case "order": {
          // Subcommand
          switch (queries[query]) {
            case "name": {
              // const orderNameQuery = queries[Number(query) + 1];
              // const searchType = urls.poolSearch.order.name;

              urlBuilder.query = queries[query];
              urlBuilder.search = queries[i];
              break;
            }
            case "created": {
              // const createdAtQuery = queries[Number(query) +1];
              // const searchType = urls.poolSearch.order.createdAt;

              urlBuilder.query = `${queries[query]}_at`;
              urlBuilder.search = queries[i];
              break;
            }
            case "updated": {
              // const updatedAtQuery = queries[Number(query) + 1];
              // const searchType = urls.poolSearch.order.updatedAt;

              urlBuilder.query = `${queries[query]}_at`;
              urlBuilder.search = queries[i];
              break;
            }
            case "count": {
              urlBuilder.query = urls.poolSearch.order.postCount;
              urlBuilder.search = queries[i];
            }
          }
          break;
        }
      }
    }

    console.log(urlBuilder.buildUrl());

    const poolRequest = await yiffBot.sendRequest(urlBuilder.buildUrl());
    const poolJson = await poolRequest.json();

    console.log(poolJson);
  });

  yiffBot.on("inline_query", async (ctx) => {
    // Stop processing if user types in "pools search"
    if (ctx.inlineQuery.query === "pools search") return;
    // Increase the hit counter
    yiffBot.hits++;

    // Get the current offset from Telegram
    const currentTelegramOffset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset, 10)
      : 0;

    // Set blacklist back to zero after every call
    yiffBot.blacklistedResults = 0;
    console.log(yiffBot.hits);
    // yiffBot.blacklistedResults = 0;
    // Assume we will be getting pages of results
    let moreApiPages = true;
    const request = await yiffBot.parseInlineQuery(
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
    const yiffRequest = await yiffBot.sendRequest(request.buildUrl());
    const yiffJson = await yiffRequest.json();
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
        break;
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
      cache_time: 300,
      button: {
        text: "Login",
        start_parameter: "login"
      }
    });
  });

  yiffBot.catch(async (err) => {
    await console.log(`E621Bot Error: ${err.message} Fuck You!!`);
  });

  yiffBot.start();
}
