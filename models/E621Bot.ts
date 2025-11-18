import { Bot } from "grammy";
import { E621RequestBuilder } from "./E621RequestBuilder.ts";

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
    this.hits = hits;
    this.telegramtelegramApiKey = telegramApiKey;
    this.e621ApiKey = e621ApiKey;
  }

  async sendRequest(url: string): Promise<Response> {
    const username: string = "Froogal";
    const response = await fetch(url, {
      headers: {
        "Authorization": "Basic " +
          btoa(`${username}:${Deno.env.get("E621_API_KEY")}`),
        "User-Agent": `NMDergBot/1.0 (by ${username} on e621)`,
      },
    });
    return response;
  }

  async parseInlineQuery(
    query: string,
    request_builder: E621RequestBuilder,
  ): Promise<E621RequestBuilder> {
    const queryTags: string[] = query.toLowerCase().split(" ");
    const parsedTags = new Array<string>();
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

      if (/(score|favcount|random|hot|)/.test(queryTags[tag])) {
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
}
