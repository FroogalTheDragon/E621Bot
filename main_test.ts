import { assertEquals } from "@std/assert";
import { E621Bot } from "./models/E621Bot.ts";
import { E621UrlBuilderPosts } from "./models/E621UrlBuilderPosts.ts";
import { API_PAGE_SIZE } from "./constants/numbers.ts";
import { E621UrlBuilderPools } from "./models/E621UrlBuilderPools.ts";
import * as urls from "./constants/urls.ts";
import * as numbers from "./constants/numbers.ts";


Deno.test(function buildUrlTest() {
  const testUrl =
    `https://e621.net/posts.json?tags=dragon+rating:safe&page=1&limit=${API_PAGE_SIZE}`;
  const testUrlBuilder = new E621UrlBuilderPosts();
  testUrlBuilder.tags = ["dragon"];
  testUrlBuilder.rating = "rating:safe";
  assertEquals(testUrlBuilder.buildUrl(), testUrl);
});

Deno.test(function tagStringTest() {
  const testTagString = "?tags=dragon+unicorn+rating:safe";
  const testUrlBuilder = new E621UrlBuilderPosts();
  testUrlBuilder.tags = ["dragon", "unicorn", "rating:safe"];
  assertEquals(testUrlBuilder.tagString(), testTagString);
});

Deno.test(function getFileExtensionsTest() {
  const testFile = "test-file.txt";
  const testUrlBuilder = new E621UrlBuilderPosts();
  assertEquals(testUrlBuilder.getFileExtensions(testFile), "txt");
});

// TODO!
/**
 * Test for E621Bot.processPosts()
 */
// Deno.test(function processPostsTest() {
//   const testBot = new E621Bot("TEST_TOKEN", "TEST_TOKEN");

// });

/**
 * Test for E621Bot.parseInlineQuery(query: string, urlBuilder: E621UrlBuilderPosts)
 */
Deno.test(function parseInlineQueryTest() {
  const testUrlBuilder = new E621UrlBuilderPosts();
  testUrlBuilder.tags = ["dragon", "unicorn"];
  testUrlBuilder.rating = urls.rating.safe;
  const testBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );
  assertEquals(
    testBot.parseInlineQuery(
      "dragon unicorn safe",
      new E621UrlBuilderPosts(),
    ),
    testUrlBuilder,
  );
});

/**
 * Test for E621Bot.parseInlineQueryPools()
 */
Deno.test(function parseInlineQueryPoolsTest() {
  // Create a test bot instance
  const testBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );

  // Define test queries for each case
  const testQueryName = "sp name The Little Dragon Who Could";
  const testQueryId = "sp id 12345";
  const testQueryDescription = "sp description Dragons with goggles";
  const testQueryCreatorId = "sp creator id 12345";
  const testQueryCreatorName = "sp creator name furryartistusername";
  const testQueryActive = "sp active";
  const testQueryInactive = "sp inactive";
  const testQueryCategorySeries = "sp category series";
  const testQueryCategoryCollection = "sp category collection";

  // Create test URLs should match if parseInlineQueryPools() is working
  const basePoolsUrl = `${urls.baseUrl}${urls.endpoint.json.pools}`;

  const testUrlName =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.nameMatches}]=the+little+dragon+who+could`;
  const testUrlId =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.id}]=12345`;
  const testUrlDescription =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.descriptionMatches}]=dragons+with+goggles`;
  const testUrlCreatorId =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.creatorId}]=12345`;
  const testUrlCreatorName =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.creatorName}]=furryartistusername`;
  const testUrlActive =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.isActive}]=true`;
  const testUrlInactive =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.isActive}]=false`;
  const testUrlCategorySeries =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.category}]=series`;
  const testUrlCategoryCollection =
    `${basePoolsUrl}?page=1&limit=${numbers.POOLS_PAGE_SIZE}&search[${urls.poolSearch.category}]=collection`;

  // Create instances of the URL builder built with these queries
  const testUrlBuilderName = testBot.parseInlineQueryPools(
    testQueryName,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderId = testBot.parseInlineQueryPools(
    testQueryId,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderDescription = testBot.parseInlineQueryPools(
    testQueryDescription,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderCreatorId = testBot.parseInlineQueryPools(
    testQueryCreatorId,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderCreatorName = testBot.parseInlineQueryPools(
    testQueryCreatorName,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderActive = testBot.parseInlineQueryPools(
    testQueryActive,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderInactive = testBot.parseInlineQueryPools(
    testQueryInactive,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderCategorySeries = testBot.parseInlineQueryPools(
    testQueryCategorySeries,
    new E621UrlBuilderPools(),
  );
  const testUrlBuilderCategoryCollection = testBot.parseInlineQueryPools(
    testQueryCategoryCollection,
    new E621UrlBuilderPools(),
  );

  // Run the tests use the URLs to determine if the query parser is working
  assertEquals(testUrlBuilderName.buildUrl(), testUrlName);
  assertEquals(testUrlBuilderId.buildUrl(), testUrlId);
  assertEquals(testUrlBuilderDescription.buildUrl(), testUrlDescription);
  assertEquals(testUrlBuilderCreatorId.buildUrl(), testUrlCreatorId);
  assertEquals(testUrlBuilderCreatorName.buildUrl(), testUrlCreatorName);
  assertEquals(testUrlBuilderActive.buildUrl(), testUrlActive);
  assertEquals(testUrlBuilderInactive.buildUrl(), testUrlInactive);
  assertEquals(testUrlBuilderCategorySeries.buildUrl(), testUrlCategorySeries);
  assertEquals(
    testUrlBuilderCategoryCollection.buildUrl(),
    testUrlCategoryCollection,
  );
});
// TODO: Write test for processPosts()
// TODO: Write test for getPoolsGallery()

Deno.test(async function sendRequestTest() {
  const testUrl = "https://e621.net/posts?tags=dragon+rating:safe";
  const testBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );
  const testResponse = await testBot.sendRequest(testUrl);
  await testResponse.body?.cancel(); // Cancel test request
  assertEquals(testResponse.status, 200);
});

Deno.test(function calcMegabytesTest() {
  const testBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );
  const testValue = 1024; // bytes
  assertEquals(Math.ceil(testBot.calcMegabytes(testValue)), 1);
});

Deno.test(function buildBlacklistRegexTest() {
  const testBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
    0,
    "",
    0,
    [
      "feces",
      "murder",
      "waterworks",
    ],
  );
  assertEquals(
    testBot.buildBlacklistRegex(),
    /(feces|murder|waterworks)/,
  );
});
