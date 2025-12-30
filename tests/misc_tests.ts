import { assertEquals } from "@std/assert/equals";
import { E621Bot } from "../classes/E621Bot.ts";
import { E621UrlBuilderPools } from "../classes/E621UrlBuilderPools.ts";
import * as urls from "../constants/urls.ts";

// TODO: Write test for processPosts()
Deno.test(function getPoolsGalleryTest() {
  const poolsGalleryUrl =
    `${urls.baseUrl}${urls.endpoint.json.pools}?page=1&limit=3`;
  const testUrlBuilder = new E621UrlBuilderPools();

  assertEquals(testUrlBuilder.poolsGalleryUrl(), poolsGalleryUrl);
});

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
  const blacklist: string[] = [
    "feces",
    "murder",
    "waterworks",
  ];
  const testBot = new E621Bot(
    Deno.env.get("TELEGRAM_BOT_KEY") || "",
    Deno.env.get("E621_API_KEY") || "",
  );
  assertEquals(
    testBot.buildBlacklistRegex(blacklist),
    /(feces|murder|waterworks)/,
  );
});
