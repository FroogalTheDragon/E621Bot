import { Bot } from "grammy";
import { E621RequestBuilder } from "./E621RequestBuilder.ts";
import { ONE_MEGABYTE, REQUEST_TIME_LIMIT} from "../constants/numbers.ts";
import { blacklist as bl } from "../constants/strings.ts";

/**
 * E621Bot can get streams of images based on a users inline query
 */
export class E621Bot extends Bot {
  telegramtelegramApiKey: string;
  e621ApiKey: string;
  hits: number;
  blacklist: string[];
  constructor(
    telegramApiKey: string,
    e621ApiKey: string,
    hits: number = 0,
    blacklist: string[] = bl,
  ) {
    super(telegramApiKey);
    this.telegramtelegramApiKey = telegramApiKey;
    this.e621ApiKey = e621ApiKey;
    this.hits = hits;
    this.blacklist = blacklist;
  }

  /**
   * @param url url to fetch images from
   * @returns Promise<Response>
   */
  async sendRequest(url: string): Promise<Response> {
    const sleep = (ms: number) =>
      new Promise((resolve) => {
        console.log("Request Sent");
        setTimeout(resolve, ms);
      });
    const username: string = "Froogal";
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " +
          btoa(`${username}:${this.e621ApiKey}`),
        "User-Agent": `NMDergBot/1.0 (by ${username} on e621)`,
      },
    });
    await sleep(REQUEST_TIME_LIMIT);
    return response;
  }

  /**
   * @param query
   * @param request_builder
   * @returns
   */
  async parseInlineQuery(
    query: string,
    request_builder: E621RequestBuilder,
  ): Promise<E621RequestBuilder> {
    // Parse the query string by spaces
    const queryTags: string[] = query.toLowerCase().split(" ");

    // Create an array to store the parsed tags
    const parsedTags = new Array<string>();

    // Check for key words and build key word tags as needed
    for (const tag in queryTags) {
      if (this.blacklist.length !== 0 && this.buildBlacklistRegex()?.test(queryTags[tag])) continue;
      if (
        /(today|yesterday|[0-9]{4}-[0-9]{2}-[0-9]{2})/.test(queryTags[tag])
      ) {
        request_builder.date = `date:${queryTags[tag]}`;
        continue;
      }

      if (/(safe|questionable|explicit)/.test(queryTags[tag])) {
        request_builder.rating = `rating:${queryTags[tag]}`;
        continue;
      }

      if (/(score|favcount|random|hot)/.test(queryTags[tag])) {
        request_builder.order = `order:${queryTags[tag]}`;
        continue;
      }

      if (/(jpg|png|gif|mp4|webm)/.test(queryTags[tag])) {
        request_builder.fileType = `type:${queryTags[tag]}`;
        continue;
      }
      parsedTags.push(queryTags[tag]);
    }
    request_builder.tags = parsedTags;
    return await request_builder;
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
