import { Bot, InlineQueryResultBuilder } from "grammy";
import { InlineQueryResult } from "grammy/types";
import { E621UrlBuilderPosts } from "./E621UrlBuilderPosts.ts";
import { ONE_MEGABYTE } from "../constants/numbers.ts";
import { E621UrlBuilderPools } from "./E621UrlBuilderPools.ts";
import { poolSearch } from "../constants/urls.ts";
import { Post } from "./interfaces.ts";
import { Pool } from "./interfaces.ts";
import * as strings from "../constants/strings.ts";
import * as urls from "../constants/urls.ts";
import * as numbers from "../constants/numbers.ts";

/**
 * E621Bot can get streams of images based on a users inline query
 */
export class E621Bot extends Bot {
  telegramtelegramApiKey: string;
  e621ApiKey: string;
  blacklist: string[];
  blacklistPath: string;
  hits: number;
  last_hit_time?: string;
  constructor(
    telegramApiKey: string,
    e621ApiKey: string,
    blacklist: string[],
    blacklistPath: string = "./blacklist.txt",
    hits: number = 0,
    last_hit_time?: string,
  ) {
    super(telegramApiKey);
    this.telegramtelegramApiKey = telegramApiKey;
    this.e621ApiKey = e621ApiKey;
    this.blacklist = blacklist;
    this.blacklistPath = blacklistPath;
    this.hits = hits;
    this.last_hit_time = last_hit_time;
  }

  /**
   * @param url url to fetch images from
   * @returns Promise<Response>
   */
  async sendRequest(url: string): Promise<Response> {
    const username: string = "Froogal";
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " +
          btoa(`${username}:${this.e621ApiKey}`),
        "User-Agent": `NMDergBot/1.0 (by ${username} on e621)`,
      },
    });
    return response;
  }

  /**
   * // Parse the inline query by spaces
   * @param query
   * @param request_builder
   * @returns
   */
  parseInlineQuery(
    query: string,
    urlBuilder: E621UrlBuilderPosts,
  ): E621UrlBuilderPosts {
    // Parse the query string by spaces
    const queryTags: string[] = query.toLowerCase().split(" ");

    // Create an array to store the parsed tags
    const parsedTags = new Array<string>();

    // Check for key words and build key word tags as needed
    for (const tag in queryTags) {
      if (
        /(today|yesterday|[0-9]{4}-[0-9]{2}-[0-9]{2})/.test(queryTags[tag])
      ) {
        urlBuilder.date = encodeURIComponent(`date:${queryTags[tag]}`);
        continue;
      }

      if (/(safe|questionable|explicit)/.test(queryTags[tag])) {
        urlBuilder.rating = encodeURIComponent(`rating:${queryTags[tag]}`);
        continue;
      }

      if (/(score|favcount|random|hot)/.test(queryTags[tag])) {
        urlBuilder.order = encodeURIComponent(`order:${queryTags[tag]}`);
        continue;
      }

      if (/(jpg|png|gif|mp4|webm)/.test(queryTags[tag])) {
        urlBuilder.fileType = encodeURIComponent(`type:${queryTags[tag]}`);
        continue;
      }
      parsedTags.push(queryTags[tag]);
    }
    urlBuilder.tags = parsedTags;
    return urlBuilder;
  }

  parseInlineQueryPools(
    query: string,
    urlBuilder: E621UrlBuilderPools,
  ): E621UrlBuilderPools {
    // put logic in main for pools here
    const queries = query.toLocaleLowerCase().replace("sp ", "").split(" ");

    for (let i = 0; i < queries.length; i++) {
      const query = i + 1;
      switch (queries[i]) {
        case "name": {
          let queryString = "";
          let index = 0;
          const queryArray = [];
          // Check if next index exists yet
          if (queries[query + index]) {
            while (queries[query + index] != undefined) {
              queryArray.push(queries[query + index++]);
            }
          }

          queryString = queryArray.join("+");
          urlBuilder.query = queryString;
          urlBuilder.search = poolSearch.nameMatches;
          break;
        }
        case "id": {
          console.log("Pool Id query");
          urlBuilder.search = poolSearch.id;
          urlBuilder.query = queries[i + 1];
          break;
        }
        case "description": {
          console.log(`Description query`);
          let queryString = "";
          let index = 0;
          const queryArray = [];
          // Check if next index exists yet
          if (queries[query + index]) {
            while (queries[query + index] != undefined) {
              queryArray.push(queries[query + index++]);
            }
          }

          queryString = queryArray.join("+");
          urlBuilder.search = poolSearch.descriptionMatches;
          urlBuilder.query = queryString;
          break;
        }
        case "creator": {
          // Process sub command
          switch (queries[query]) {
            case "id": {
              const cidQuery = queries[query + 1]; // creator id query
              const searchType = poolSearch.creatorId;

              urlBuilder.query = cidQuery;
              urlBuilder.search = searchType;
              console.log(`Creator Id: ${urlBuilder.search}`);
              i++;
              break;
            }
            case "name": {
              const cnmQuery = queries[query + 1]; // creator name query
              const searchType = poolSearch.creatorName;

              urlBuilder.query = cnmQuery;
              urlBuilder.search = searchType;
              i++;
              break;
            }
          }
          break;
        }
        case "active": {
          urlBuilder.query = "true";
          urlBuilder.search = poolSearch.isActive;
          break;
        }
        case "inactive": {
          urlBuilder.query = "false";
          urlBuilder.search = poolSearch.isActive;
          break;
        }
        case "category": {
          // Process subcommands
          switch (queries[query]) {
            case "series": {
              urlBuilder.query = queries[query];
              break;
            }
            case "collection": {
              urlBuilder.query = queries[query];
              break;
            }
          }
          urlBuilder.search = poolSearch.category;
          break;
        }
        case "order": {
          // Subcommand
          switch (queries[query]) {
            case "name": {
              urlBuilder.query = queries[query];
              urlBuilder.search = queries[i];
              break;
            }
            case "created": {
              urlBuilder.query = `${queries[query]}_at`;
              urlBuilder.search = queries[i];
              break;
            }
            case "updated": {
              urlBuilder.query = `${queries[query]}_at`;
              urlBuilder.search = queries[i];
              break;
            }
            case "count": {
              urlBuilder.query = poolSearch.order.postCount;
              urlBuilder.search = queries[i];
            }
          }
          break;
        }
      }
    }
    return urlBuilder;
  }

  processPosts(posts: Post[]): InlineQueryResult[] {
    const inlineQueryResults: InlineQueryResult[] = [];

    post_loop:
    for (const post in posts) {
      const tagMatrix: string[][] = [];
      Object.keys(posts[post].tags).forEach((key: string) => {
        // Loop through the tags and add them to the tags array
        tagMatrix.push(posts[post].tags[key]);
      });
      const tags = tagMatrix.flat();

      // Check for blacklisted tags
      for (const tag in tags) {
        if (this.buildBlacklistRegex()?.test(tags[tag])) {
          console.log("Blacklisted found skipping post!");
          continue post_loop; // Skip this post if a blacklisted tag was found
        }
      }
      // Check filetype and build InlineQueryResult of that type
      switch (posts[post].fileType) {
        case (strings.fileTypes.jpg): {
          const result = InlineQueryResultBuilder.photo(
            String(posts[post].id),
            posts[post].url,
          );
          inlineQueryResults.push(result);
          break;
        }
        case (strings.fileTypes.png): {
          const result = InlineQueryResultBuilder.photo(
            String(posts[post].id),
            posts[post].url,
          );
          inlineQueryResults.push(result);
          break;
        }
        case (strings.fileTypes.gif): {
          const result = InlineQueryResultBuilder.gif(
            `${posts[post].id}`,
            posts[post].url,
            posts[post].previewUrl,
          );
          inlineQueryResults.push(result);
          break;
        }
        case (strings.fileTypes.mp4): {
          console.log(
            `Mp4 File Size: ${this.calcMegabytes(posts[post].fileSize)}`,
          );
          const result = (this.calcMegabytes(posts[post].fileSize) >
              numbers.MAX_FILE_SIZE)
            ? InlineQueryResultBuilder.videoMp4(
              `${posts[post].id}`,
              `${posts[post].title}`,
              `${posts[post].url}`,
              `${posts[post].previewUrl}`,
            ).text(
              `${urls.baseUrl}${urls.endpoint.posts}/${posts[post].id}`,
            )
            : InlineQueryResultBuilder.videoMp4(
              `${posts[post].id}`,
              `${posts[post].title}`,
              `${posts[post].url}`,
              `${posts[post].previewUrl}`,
            );
          inlineQueryResults.push(result);
          break;
        }
        case (strings.fileTypes.webm): {
          const result = InlineQueryResultBuilder.photo(
            `${posts[post].id}`,
            `${posts[post].previewUrl}`,
          ).text(
            `${urls.baseUrl}${urls.endpoint.posts}/${posts[post].id}`,
          );
          inlineQueryResults.push(result);
          break;
        }
        default: {
          console.log(
            `Unknown File Extension: ${posts[post].fileType}`,
          );
          break;
        }
      }
    }
    return inlineQueryResults;
  }

  processPools(pools: Pool[]): InlineQueryResult[] {
    const inlineQueryResults: InlineQueryResult[] = [];
    for (const pool in pools) {
      const result = InlineQueryResultBuilder.article(
        String(pools[pool].id),
        pools[pool].name,
        {
          thumbnail_url: pools[pool].thumbnailUrl,
        },
      ).text(`${pools[pool].url}`);

      inlineQueryResults.push(result);
    }
    return inlineQueryResults;
  }

  /**
   * Calculate the number of megabytes were passed
   * @param bytes
   * @returns The number of bytes passed to it in megabyte format
   */
  calcMegabytes(bytes: number): number {
    return bytes / ONE_MEGABYTE; // Divide number of bytes by the number of bytes equal to one megabytes
  }

  buildBlacklistRegex(): RegExp | null {
    if (this.blacklist.length === 0) return null;
    return new RegExp("(" + this.blacklist.join("|") + ")");
  }
}
