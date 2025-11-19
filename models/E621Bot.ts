import { Bot } from "grammy";
import { E621RequestBuilder } from "./E621RequestBuilder.ts";

/**
 * 
 */
export class E621Bot extends Bot {
  telegramtelegramApiKey: string;
  e621ApiKey: string;
  hits: number;
  constructor(
    telegramApiKey: string,
    e621ApiKey: string,
    hits: number = 0,
  ) {
    super(telegramApiKey);
    this.telegramtelegramApiKey = telegramApiKey;
    this.e621ApiKey = e621ApiKey;
    this.hits = hits;
  }

  /**
   * 
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
   * 
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
      console.log(queryTags[tag]);
      if (/(today|yesterday|[0-9]{4}-[0-9]{2}-[0-9]{2})/.test(queryTags[tag])) {
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

  calcMegabytes(bytes: number): number {
    return bytes / 1_048_576;
  }
}
