import { assertEquals } from "@std/assert/equals";
import { API_PAGE_SIZE } from "../constants/numbers.ts";
import { E621UrlBuilderPosts } from "../classes/E621UrlBuilderPosts.ts";

Deno.test(function buildUrlPostsTest() {
  const testUrl =
    `https://e621.net/posts.json?tags=dragon+rating:safe&page=1&limit=${API_PAGE_SIZE}`;
  const testUrlBuilder = new E621UrlBuilderPosts();
  testUrlBuilder.tags = ["dragon"];
  testUrlBuilder.rating = "rating:safe";
  assertEquals(testUrlBuilder.buildUrl(), testUrl);
});

Deno.test(function buildUrlPoolsTest() {
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
