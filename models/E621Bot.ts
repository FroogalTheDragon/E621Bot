import { Bot } from "grammy";
import { E621UrlBuilderPosts } from "./E621UrlBuilderPosts.ts";
import { ONE_MEGABYTE, REQUEST_TIME_LIMIT } from "../constants/numbers.ts";
import { blacklist as bl } from "../constants/strings.ts";
import { E621UrlBuilderPools } from "./E621RequestBuilderPools.ts";
import { poolSearch } from "../constants/urls.ts";
import { InlineQueryResult } from "grammy/types";

/**
 * E621Bot can get streams of images based on a users inline query
 */
export class E621Bot extends Bot {
  telegramtelegramApiKey: string;
  e621ApiKey: string;
  hits: number;
  blacklistedResults: number;
  blacklist: string[];
  currentBatchOfResults?: Response; // use this to store the current batch of results, and use a function to signal you need more results when the user has scrolled through all the ones inthe current batch.
  constructor(
    telegramApiKey: string,
    e621ApiKey: string,
    hits: number = 0,
    blacklistedResults: number = 0,
    blacklist: string[] = bl,
    currentBatchOfResults?: Response,
  ) {
    super(telegramApiKey);
    this.telegramtelegramApiKey = telegramApiKey;
    this.e621ApiKey = e621ApiKey;
    this.hits = hits;
    this.blacklistedResults = blacklistedResults;
    this.blacklist = blacklist;
    this.currentBatchOfResults = currentBatchOfResults;
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
        urlBuilder.date = `date:${queryTags[tag]}`;
        continue;
      }

      if (/(safe|questionable|explicit)/.test(queryTags[tag])) {
        urlBuilder.rating = `rating:${queryTags[tag]}`;
        continue;
      }

      if (/(score|favcount|random|hot)/.test(queryTags[tag])) {
        urlBuilder.order = `order:${queryTags[tag]}`;
        continue;
      }

      if (/(jpg|png|gif|mp4|webm)/.test(queryTags[tag])) {
        urlBuilder.fileType = `type:${queryTags[tag]}`;
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
    const queries = query.replace("search pools ", "").split(" ");

    for (let i = 0; i < queries.length; i++) {
      const query = i + 1;
      switch (queries[i]) {
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
          let catQuery = "";
          const searchType = poolSearch.category;
          // Process subcommands
          switch (queries[query + 1]) {
            case "series": {
              catQuery = "series";
              i++;
              break;
            }
            case "collection": {
              catQuery = "collection";
              i++;
              break;
            }
          }

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
