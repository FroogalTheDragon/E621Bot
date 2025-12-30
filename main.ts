import { E621Bot } from "./classes/E621Bot.ts";
import { E621UrlBuilderPosts } from "./classes/E621UrlBuilderPosts.ts";
import { E621UrlBuilderPools } from "./classes/E621UrlBuilderPools.ts";
import { Post } from "./interfaces.ts";
import { Pool } from "./interfaces.ts";
import * as numbers from "./constants/numbers.ts";
import * as urls from "./constants/urls.ts";
import * as strings from "./constants/strings.ts";
import { existsSync } from "node:fs";
import { createDatabase } from "./db/utils/createDb.ts";
import {
  getUserByTelegramId as getUserByTelegramId,
  insertUser as insertUser,
  userExists as userExists,
} from "./models/user.ts";

if (import.meta.main) {
  try {
    // Create the directory structure create it and the db it its not there.
    if (!existsSync(strings.DB_FILE)) {
      if (!existsSync("db/prod_db")) {
        Deno.mkdir("db/prod_db", { recursive: true });
      }
      console.log("Creating directory structure");
      Deno.mkdir("db/prod_db", { recursive: true });

      console.log("Attempting to create blacklist database");
      if (!createDatabase(strings.DB_FILE)) {
        throw new Error(`Failed to create blacklist DB`);
      }
      console.log("Database created!");
    } else {
      console.log(`Database found at ${strings.DB_FILE}!`);
    }

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
      await ctx.reply(
        `I have processed ${yiffBot.hits} requests, and I was last used at ${yiffBot.last_hit_time}`,
      );
    });

    yiffBot.command("blacklist", async (ctx) => {
      const user = getUserByTelegramId(ctx.from?.id!, strings.DB_FILE);
      if (user) {
        await ctx.reply(
          `This is your current blacklist: \n <b>${
            user.blacklist.join("\n")
          }</b>`,
          { parse_mode: "HTML" },
        );
      }
    });

    yiffBot.command("edit_blacklist", async (ctx) => {
      await ctx.conversation.enter("edit_blacklist");
    });

    yiffBot.command("help", async (ctx) => {
      await ctx.reply(strings.helpString, { parse_mode: "HTML" });
    });

    // INLINE QUERIES

    /**
     * Search for pools
     */
    yiffBot.inlineQuery(/searchpools */, async (ctx) => {
      const urlBuilder = yiffBot.parseInlineQueryPools(
        ctx.inlineQuery.query,
        new E621UrlBuilderPools(),
      );

      // Get the current offset from Telegram
      const offset = ctx.inlineQuery.offset
        ? parseInt(ctx.inlineQuery.offset)
        : 0;

      const nextOffset = offset + numbers.POOLS_INLINE_LOAD_COUNT;
      const page = Math.floor(offset / numbers.POOLS_PAGE_SIZE) + 1;
      const pageOffset = offset % numbers.POOLS_PAGE_SIZE;

      urlBuilder.page = page;

      console.log(`Page Number: ${page}`);
      console.log(`Current Offset: ${offset}`);
      console.log(`Next Offset: ${nextOffset}`);
      console.log(`Page Offset: ${pageOffset}`);

      // Grab our data
      let poolsRequest;
      if (
        ctx.inlineQuery.query.toLocaleLowerCase().replace("searchpools", "") ===
          ""
      ) {
        console.log(`Current URL: ${urlBuilder.poolsGalleryUrl()}`);
        poolsRequest = await yiffBot.sendRequest(urlBuilder.poolsGalleryUrl());
      } else {
        console.log(`Current URL: ${urlBuilder.buildUrl()}`);
        poolsRequest = await yiffBot.sendRequest(urlBuilder.buildUrl());
      }

      const poolJson = await poolsRequest.json();

      // If posts length is 0 we have reached the end of the data
      if (poolJson.length === 0) {
        console.log("No Data Found");
        return;
      }

      const pools: Pool[] = await Promise.all( // Promise all to await all of the sendRequest() calls
        poolJson.map(
          async (pool: Pool) => {
            const thumbnailRequestUrl =
              `${urls.baseUrl}${urls.endpoint.json.posts}?tags=id:${
                pool.post_ids[0]
              }`;

            // console.log(thumbnailRequestUrl);
            const thumbnailUrlRequest = await yiffBot.sendRequest(
              thumbnailRequestUrl,
            );
            const thumbnailUrlJson = await thumbnailUrlRequest.json();
            const thumbnailUrl: string =
              thumbnailUrlJson.posts[0].preview.url ||
              ""; // Set to empty if undefined
            return <Pool> {
              id: pool.id,
              name: pool.name,
              url: `${urls.baseUrl}${urls.endpoint.pools}/${pool.id}`,
              thumbnailUrl: thumbnailUrl, // Set the thumbnail image to the first image in the pool
            };
          },
        ),
      );

      const poolResults = yiffBot.processPools(pools);
      let poolBatch;
      if (poolResults.length > 0) {
        poolBatch = poolResults.slice(
          pageOffset,
          pageOffset + numbers.POOLS_INLINE_LOAD_COUNT,
        );
      } else {
        poolBatch = poolResults;
      }

      await ctx.answerInlineQuery(poolBatch, {
        cache_time: numbers.POOLS_CACHE_TIME,
        next_offset: String(nextOffset),
        is_personal: true,
      });
    });

    yiffBot.on("chosen_inline_result", () => {
      const date = new Date(); // Create a new date object to get time and date from
      const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      });

      yiffBot.hits++; // Increase hit count by one
      yiffBot.last_hit_time = `${date.toDateString()} - ${time}`; // Set last_hit_time to right now
    });

    /**
     * Handle general searches
     */
    yiffBot.on("inline_query", async (ctx) => {
      // Create new user if not exists
      if (!userExists(ctx.from.id, strings.DB_FILE)) {
        insertUser({ telegramId: ctx.from.id, blacklist: [] }, strings.DB_FILE);
      }
      const user = getUserByTelegramId(ctx.from.id, strings.DB_FILE);

      // Parse the inline query and create a new URL builder object based on the query
      const urlBuilder = yiffBot.parseInlineQuery(
        ctx.inlineQuery.query,
        new E621UrlBuilderPosts(),
      );

      // Stop processing if user types in "sp *"
      if (/searchpools */.test(ctx.inlineQuery.query)) return;
      if (ctx.inlineQuery.query == "") {
        urlBuilder.date = urls.date.today;
      }

      // Get the current offset from Telegram
      const offset = ctx.inlineQuery.offset
        ? parseInt(ctx.inlineQuery.offset)
        : 0;
      const nextOffset = offset + numbers.IMAGE_LOAD_COUNT;
      const page = Math.floor(offset / numbers.API_PAGE_SIZE) + 1;
      const pageOffset = offset % numbers.API_PAGE_SIZE;

      console.log(`Page Number: ${page}`);
      console.log(`Current Offset: ${offset}`);
      console.log(`Next Offset: ${nextOffset}`);
      console.log(`Page Offset: ${pageOffset}`);

      urlBuilder.page = page;

      console.log(`Current URL: ${urlBuilder.buildUrl()}`);

      // Grab our data
      const request = await yiffBot.sendRequest(urlBuilder.buildUrl());
      const requestJson = await request.json();
      const postsJson = requestJson.posts; // An array of 50 posts

      // console.log(postsJson[0]);

      // If posts length is 0 we have reached the end of the data
      if (postsJson.length === 0) {
        console.log("No Data Found");
      }

      const posts: Post[] = postsJson.map(
        (post: Post) => {
          return <Post> {
            title: post.tags.artist[0],
            id: post.id,
            url: post.file.url,
            previewUrl: post.preview.url,
            fileType: post.file.ext,
            fileSize: post.file.size,
            tags: post.tags,
          };
        },
      );

      // Process and filter posts through blacklist
      const inlineResults = yiffBot.processPosts(posts, user!.blacklist);
      console.log(`Number of Results Retrieved: ${inlineResults.length}`);

      let resultBatch;

      // Setting this to > 0 was the fix for searching by id and getting back a bunch of the same result instead of just one of that result
      if (inlineResults.length > 0) {
        resultBatch = inlineResults.slice(
          pageOffset,
          pageOffset + numbers.IMAGE_LOAD_COUNT,
        );
      } else {
        resultBatch = inlineResults;
      }
      // if (offset >= pageOffset) ; // Reset the offset if we have reached the end of the current batch of results

      console.log(`Current Batch Sample: ${resultBatch.length}`);

      await ctx.answerInlineQuery(resultBatch, {
        cache_time: numbers.POSTS_CACHE_TIME,
        next_offset: String(nextOffset),
        is_personal: true,
      });
    });

    yiffBot.catch((err) => {
      console.error(
        `E621Bot Error: ${err.message}:${err.ctx.chosenInlineResult}`,
      );
    });
    await yiffBot.start();
    console.log("Bot Started!");
  } catch (error) {
    console.error(
      `Encountered and error while trying to start the bot: ${error}`,
    );
  }
}
