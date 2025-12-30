import { POOLS_PAGE_SIZE } from "../constants/numbers.ts";
import { E621UrlBuilder } from "./interfaces.ts";
import * as urls from "../constants/urls.ts";

export class E621UrlBuilderPools implements E621UrlBuilder {
  baseUrl: string;
  endpoint: string;
  limit: number;
  page: number;
  search?: string;
  query?: string;

  constructor(
    baseUrl: string = urls.baseUrl,
    endpoint: string = urls.endpoint.json.pools,
    limit: number = POOLS_PAGE_SIZE,
    page: number = 1,
    search?: string,
    query?: string,
  ) {
    this.baseUrl = baseUrl;
    this.endpoint = endpoint;
    this.limit = limit;
    this.page = page;
    this.search = search;
    this.query = query;
  }

  // TODO: This URL isn't correct because the user can search multiple things in the website, so we need to build this url with
  // all options available, multiple &search[] terms are allowed on e621 so lets support it.
  buildUrl(): string {
    return `${this.baseUrl}${this.endpoint}?page=${this.page}&limit=${this.limit}&search[${this.search}]=${
      this.query?.split(" ").join("+")
    }`;
  }

  poolsGalleryUrl(): string {
    return `${this.baseUrl}${this.endpoint}?page=${this.page}&limit=${this.limit}`;
  }
}
