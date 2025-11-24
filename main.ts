import { InlineQueryResult } from "grammy/types";
import { E621Bot } from "./models/E621Bot.ts";
import { InlineQueryResultBuilder } from "grammy";
import { E621UrlBuilderPosts } from "./models/E621UrlBuilderPosts.ts";
import { E621UrlBuilderPools } from "./models/E621UrlBuilderPools.ts";
import { Post } from "./models/Post.ts";
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

  /**
   * Search for pools
   */
  yiffBot.inlineQuery(/sp */, async (ctx) => {
    const currentTelegramOffset = ctx.inlineQuery.offset
      ? parseInt(ctx.inlineQuery.offset, 10)
      : 0;
    console.log(currentTelegramOffset);

    // Calculate the page number to pull from the API
    const apiPageToFetch =
      Math.floor(currentTelegramOffset / numbers.POOLS_PAGE_SIZE) + 1;

    console.log(`Page: ${apiPageToFetch}`);
    let urlBuilder;
    ctx.inlineQuery.query
      ? urlBuilder = yiffBot.parseInlineQueryPools(
        ctx.inlineQuery.query,
        new E621UrlBuilderPools(),
      )
      : urlBuilder = new E621UrlBuilderPools();
    urlBuilder.page = apiPageToFetch;

    let poolRequest;
    if (ctx.inlineQuery.query === "sp" || ctx.inlineQuery.query === "sp ") {
      poolRequest = await yiffBot.sendRequest(urlBuilder.getPoolsGallery());
    } else {
      poolRequest = await yiffBot.sendRequest(urlBuilder.buildUrl());
    }

    console.log(poolRequest.url);
    const poolJson = await poolRequest.json();

    if (poolJson.length === 0) {
      console.log("END OF CONTENT");
      return;
    }

    // Create a posts URLBuilder object to re-use in this loop
    const postUrlBuilder = new E621UrlBuilderPosts();
    const poolInlineQueryResults: Array<InlineQueryResult> = [];
    for (const pool in poolJson) {
      postUrlBuilder.tags = [`id:${poolJson[pool].post_ids[0]}`];
      const thumbnailPostRequest = await yiffBot.sendRequest(
        postUrlBuilder.buildUrl(),
      );
      const thumbnailPostJson = await thumbnailPostRequest.json();
      // const thumbnailUrl = thumbnailPostJson.posts[0].preview.url;
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

    await ctx.answerInlineQuery(poolSlice, {
      cache_time: numbers.POOLS_CACHE_TIME,
      next_offset: String(newOffset),
    });
  });

  yiffBot.on("chosen_inline_result", async (ctx) => {
    console.log(ctx.chosenInlineResult);
    if (/sp/.test(ctx.chosenInlineResult.query)) {
      await yiffBot.api.sendMessage(
        ctx.chosenInlineResult.from.id,
        `Here's a copy for yourself ${ctx.chosenInlineResult.from.username} from ${urls.baseUrl}${urls.endpoint.pools}/${ctx.chosenInlineResult.result_id} gotten with ${ctx.chosenInlineResult.query}`,
      );
      return;
    }
    await yiffBot.api.sendMessage(
      ctx.chosenInlineResult.from.id,
      `Here's a copy for yourself ${ctx.chosenInlineResult.from.username} from ${urls.baseUrl}${urls.endpoint.posts}/${ctx.chosenInlineResult.result_id} gotten with ${ctx.chosenInlineResult.query}`,
    );
  });

  /**
   * Handle general searches
   */
  yiffBot.on("inline_query", async (ctx) => {
    // Parse the inline query and create a new URL builder object based on the query
    const urlBuilder = yiffBot.parseInlineQuery(
      ctx.inlineQuery.query,
      new E621UrlBuilderPosts(),
    );

    // Stop processing if user types in "sp *"
    if (/sp */.test(ctx.inlineQuery.query)) return;
    if (ctx.inlineQuery.query === "") urlBuilder.date = encodeURIComponent(urls.date.today);
    // Increase the hit counter
    yiffBot.hits++;

    // Get the current offset from Telegram
    const offset = ctx.inlineQuery.offset ? parseInt(ctx.inlineQuery.offset) : 0;
    const nextOffset = offset + numbers.IMAGE_LOAD_COUNT;
    const page = Math.floor(offset / numbers.API_PAGE_SIZE) + 1;
    const pageOffset = offset % numbers.API_PAGE_SIZE;

    console.log(`Page Number: ${page}`);
    console.log(`Current Offset: ${offset}`);
    console.log(`Next Offset: ${nextOffset}`);
    console.log(`Page Offset: ${pageOffset}`);
    // Set blacklist back to zero after every call
    yiffBot.blacklistedResults = 0;

    urlBuilder.page = page;

    console.log(`Current URL: ${urlBuilder.buildUrl()}`);

    // Grab our data
    const request = await yiffBot.sendRequest(urlBuilder.buildUrl());
    const requestJson = await request.json();
    const postsJson = requestJson.posts;

    // console.log(postsJson[0]);

    // If posts length is 0 we have reached the end of the data
    if (postsJson.length === 0) {
      console.log("No Data Found");
    }

    const posts: Post[] = postsJson.map(
      (
        post: {
          tags: {
            artist: string[];
          };
          id: number;
          file: {
            size: number;
            ext: string;
            url: string;
          };
          preview: { url: string };
        },
      ) => {
        return <Post> {
          title: post.tags.artist[0],
          id: post.id,
          url: post.file.url,
          previewUrl: post.preview.url,
          fileType: post.file.ext,
          fileSize: post.file.size,
        };
      },
    );

    const inlineResults = yiffBot.processPosts(posts);
    console.log(`Number of Results Retrieved: ${inlineResults.length}`);

    let resultBatch;

    // Setting this to > 0 was the fix for searching by id and getting back a bunch of the same result instead of just one of that result
    if (inlineResults.length > 0) {
      resultBatch = inlineResults.slice(
        pageOffset,
        pageOffset + numbers.IMAGE_LOAD_COUNT
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

  yiffBot.catch(async (err) => {
    await console.log(
      `E621Bot Error: ${err.message}:${err.ctx.chosenInlineResult} Fuck You!!`,
    );
  });

  yiffBot.start();
}
