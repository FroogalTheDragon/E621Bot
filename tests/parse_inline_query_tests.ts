import { assertEquals } from "@std/assert/equals";
import { E621Bot } from "../classes/E621Bot.ts";
import { E621UrlBuilderPools } from "../classes/E621UrlBuilderPools.ts";
import { E621UrlBuilderPosts } from "../classes/E621UrlBuilderPosts.ts";
import * as urls from "../constants/urls.ts";
import * as numbers from "../constants/numbers.ts";

/**
 * Test for E621Bot.parseInlineQuery(query: string, urlBuilder: E621UrlBuilderPosts)
 */
Deno.test(function parseInlineQueryTest() {
  const testBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );

  // Create our test queries
  // Date queries
  const todayQuery = "dragons today";
  const yesterdayQuery = "dragons yesterday";
  const dateQuery = "dragons 2024-10-10";

  // Rating query
  const safeQuery = "dragons safe";
  const questionableQuery = "dragons questionable";
  const explicitQuery = "dragons explicit"; // e621 is Explicit by default

  // Order query
  const scoreQuery = "dragons score";
  const favcountQuery = "dragons favcount";
  const randomQuery = "dragons random";
  const hotQuery = "dragons hot";

  // Fietype query
  const jpgQuery = "dragons jpg";
  const pngQuery = "dragons png";
  const gifQuery = "dragons gif";
  const mp4Query = "dragons mp4";
  const webmQuery = "dragons webm";

  // Mixed search queries
  const mixedSearchQuery1 = "dragons today mp4";
  const mixedSearchQuery2 = "dragons random gif";
  const mixedSearchQuery3 = "dragons questionable favcount";

  // Create test URL builders with processPosts()
  // Date Urlbuilders
  const todayUrlBuilder = testBot.parseInlineQuery(
    todayQuery,
    new E621UrlBuilderPosts(),
  );
  const yesterdayUrlBuilder = testBot.parseInlineQuery(
    yesterdayQuery,
    new E621UrlBuilderPosts(),
  );
  const dateUrlBuilder = testBot.parseInlineQuery(
    dateQuery,
    new E621UrlBuilderPosts(),
  );

  // Order Urlbuilders
  const safeUrlBuilder = testBot.parseInlineQuery(
    safeQuery,
    new E621UrlBuilderPosts(),
  );
  const questionableUrlBuilder = testBot.parseInlineQuery(
    questionableQuery,
    new E621UrlBuilderPosts(),
  );
  const explicitUrlBuilder = testBot.parseInlineQuery(
    explicitQuery,
    new E621UrlBuilderPosts(),
  );

  // Order Urlbuilders
  const scoreUrlBuilder = testBot.parseInlineQuery(
    scoreQuery,
    new E621UrlBuilderPosts(),
  );
  const favcountUrlBuilder = testBot.parseInlineQuery(
    favcountQuery,
    new E621UrlBuilderPosts(),
  );
  const randomUrlBuilder = testBot.parseInlineQuery(
    randomQuery,
    new E621UrlBuilderPosts(),
  );
  const hotUrlBuilder = testBot.parseInlineQuery(
    hotQuery,
    new E621UrlBuilderPosts(),
  );

  // Filetype Urlbuilders
  const jpgUrlBuilder = testBot.parseInlineQuery(
    jpgQuery,
    new E621UrlBuilderPosts(),
  );
  const pngUrlBuilder = testBot.parseInlineQuery(
    pngQuery,
    new E621UrlBuilderPosts(),
  );
  const gifUrlBuilder = testBot.parseInlineQuery(
    gifQuery,
    new E621UrlBuilderPosts(),
  );
  const mp4UrlBuilder = testBot.parseInlineQuery(
    mp4Query,
    new E621UrlBuilderPosts(),
  );
  const webmUrlBuilder = testBot.parseInlineQuery(
    webmQuery,
    new E621UrlBuilderPosts(),
  );

  // Mixed search Urlbuilders
  const mixedSearchUrlBuilder1 = testBot.parseInlineQuery(
    mixedSearchQuery1,
    new E621UrlBuilderPosts(),
  );
  const mixedSearchUrlBuilder2 = testBot.parseInlineQuery(
    mixedSearchQuery2,
    new E621UrlBuilderPosts(),
  );
  const mixedSearchUrlBuilder3 = testBot.parseInlineQuery(
    mixedSearchQuery3,
    new E621UrlBuilderPosts(),
  );

  // Test urls to compare the urls built parsing these queries
  const postsUrl = `${urls.baseUrl}${urls.endpoint.json.posts}?tags=`;

  // Date urls
  const todayUrl =
    `${postsUrl}dragons+${urls.date.today}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const yesterdayUrl =
    `${postsUrl}dragons+${urls.date.yesterday}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const dateUrl =
    `${postsUrl}dragons+${urls.date.byDate}2024-10-10&page=1&limit=${numbers.API_PAGE_SIZE}`;

  // Rating urls
  const safeUrl =
    `${postsUrl}dragons+${urls.rating.safe}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const questionableUrl =
    `${postsUrl}dragons+${urls.rating.questionable}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const explicitUrl =
    `${postsUrl}dragons+${urls.rating.explicit}&page=1&limit=${numbers.API_PAGE_SIZE}`;

  // Order urls
  const scoreUrl =
    `${postsUrl}dragons+${urls.order.score}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const favcountUrl =
    `${postsUrl}dragons+${urls.order.favcount}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const randomUrl =
    `${postsUrl}dragons+${urls.order.random}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const hotUrl =
    `${postsUrl}dragons+${urls.order.hot}&page=1&limit=${numbers.API_PAGE_SIZE}`;

  // File urls
  const jpgUrl =
    `${postsUrl}dragons+${urls.fileType.jpg}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const pngUrl =
    `${postsUrl}dragons+${urls.fileType.png}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const gifUrl =
    `${postsUrl}dragons+${urls.fileType.gif}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const mp4Url =
    `${postsUrl}dragons+${urls.fileType.mp4}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const webmUrl =
    `${postsUrl}dragons+${urls.fileType.webm}&page=1&limit=${numbers.API_PAGE_SIZE}`;

  // Mixed search urls
  const mixedSearchUrl1 =
    `${postsUrl}dragons+${urls.date.today}+${urls.fileType.mp4}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const mixedSearchUrl2 =
    `${postsUrl}dragons+${urls.fileType.gif}+${urls.order.random}&page=1&limit=${numbers.API_PAGE_SIZE}`;
  const mixedSearchUrl3 =
    `${postsUrl}dragons+${urls.rating.questionable}+${urls.order.favcount}&page=1&limit=${numbers.API_PAGE_SIZE}`;

  // Date asserts
  assertEquals(todayUrlBuilder.buildUrl(), todayUrl);
  assertEquals(yesterdayUrlBuilder.buildUrl(), yesterdayUrl);
  assertEquals(dateUrlBuilder.buildUrl(), dateUrl);

  // Rating asserts
  assertEquals(safeUrlBuilder.buildUrl(), safeUrl);
  assertEquals(questionableUrlBuilder.buildUrl(), questionableUrl);
  assertEquals(explicitUrlBuilder.buildUrl(), explicitUrl);

  // Order asserts
  assertEquals(scoreUrlBuilder.buildUrl(), scoreUrl);
  assertEquals(favcountUrlBuilder.buildUrl(), favcountUrl);
  assertEquals(randomUrlBuilder.buildUrl(), randomUrl);
  assertEquals(hotUrlBuilder.buildUrl(), hotUrl);

  // Filetype asserts
  assertEquals(jpgUrlBuilder.buildUrl(), jpgUrl);
  assertEquals(pngUrlBuilder.buildUrl(), pngUrl);
  assertEquals(gifUrlBuilder.buildUrl(), gifUrl);
  assertEquals(mp4UrlBuilder.buildUrl(), mp4Url);
  assertEquals(webmUrlBuilder.buildUrl(), webmUrl);

  // Mixed search asserts
  assertEquals(mixedSearchUrlBuilder1.buildUrl(), mixedSearchUrl1);
  assertEquals(mixedSearchUrlBuilder2.buildUrl(), mixedSearchUrl2);
  assertEquals(mixedSearchUrlBuilder3.buildUrl(), mixedSearchUrl3);
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
