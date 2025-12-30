import * as urls from "../constants/urls.ts";
import { API_PAGE_SIZE } from "../constants/numbers.ts";
import { E621UrlBuilder } from "./interfaces.ts";

/**
 * Build an e621 URL based on parameters passed to this class
 */
export class E621UrlBuilderPosts implements E621UrlBuilder {
  baseUrl: string;
  endpoint: string;
  limit?: number;
  date?: string;
  page: number;
  tags?: string[];
  fileType?: string;
  rating?: string;
  order?: string;

  /**
   * E621UrlBuilderPosts constructor
   * @param limit - Limit how many images load
   * @param page - Set the page number to grab images from
   * @param tags - Tags the user is searching for
   * @param date - Date to grab posts from
   * @param fileType - Set the file type of files to grab
   * @param rating - Set the rating of the images
   * @param order - Set the order to load the images in
   */
  constructor(
    baseUrl: string = urls.baseUrl,
    endpoint: string = urls.endpoint.json.posts,
    limit: number = API_PAGE_SIZE, // How many images to load at a time
    page: number = 1, // The page number to grab images from
    tags?: string[], // Tags Image, artist, species ALL THE TAGS!!
    date?: string, // Date to pull images from
    fileType?: string, // File type to search by
    rating?: string, // Rating Safe, Questionable, Explicit
    order?: string, // The order to display the images
  ) {
    this.baseUrl = baseUrl;
    this.endpoint = endpoint;
    this.date = date;
    this.page = page;
    this.tags = tags;
    this.fileType = fileType;
    this.rating = rating;
    this.limit = limit;
    this.order = order;
  }

  /**
   * This function takes the current state of the buider and creates a tag string
   * separated by '+' to insert into the url.
   * @returns string of tags separated by a '+'
   */
  tagString(): string {
    // Build master array of tags + special tags
    const tags: Array<string> = Array.prototype.concat(
      this.tags,
      this.rating,
      this.date,
      this.fileType,
      this.order,
    );

    // Return list of tags separated by '+'
    return `?tags=${tags.filter((tag) => tag != null && tag !== "").join("+")}`;
  }

  /**
   * Returns a URL built fromt he current state of the builder itself and a base URL
   * @returns string URL built from the current state of the builder
   */
  buildUrl() {
    return `${this.baseUrl}${this.endpoint}${this.tagString()}&page=${this.page}&limit=${this.limit}`;
  }

  /**
   * Get the file extension of the file or url passed to it.
   * @param file
   * @returns string file extension
   */
  getFileExtensions(file: string) {
    return file.split(".").pop();
  }
}
