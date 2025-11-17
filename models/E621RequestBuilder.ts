import * as urls from "../constants/urls.ts";

export class E621RequestBuilder {
  limit?: number;
  date?: string;
  page?: number
  tags?: string[];
  fileType?: string;
  rating?: string;
  order?: string;

  constructor(
    limit: number = 320, // How many images to load at a time
    page: number = 1,
    tags?: string[], // Tags Image, artist, species ALL THE TAGS!!
    date?: string, // Date to pull images from
    fileType?: string, // File type to search by
    rating?: string, // Rating Safe, Questionable, Explicit
    order?: string, // The order to display the images
  ) {
    this.date = date;
    this.page = page;
    this.tags = tags;
    this.fileType = fileType;
    this.rating = rating;
    this.limit = limit;
    this.order = order;
  }

  tagString(): string {
    const tags: Array<string> = Array.prototype.concat(
      this.tags,
      this.rating,
      this.date,
      this.fileType,
      this.order,
    );

    let tagString: string = "";
    for (let i = 0; i < tags.length; i++) {
      if (tags[i] == null) continue;
      tagString += tags[i] + "+";
    }
    if (tagString.startsWith('+')) tagString = tagString.substring(1);
    return tagString.slice(0, -1); // Remove the trailing + the building process
  }

  buildUrl() {
    return `${urls.baseUrlTags}?page=${this.page}&tags=${this.tagString()}&limit=${this.limit}`;
  }

  getFileExtensions(file: string) {
    return file.split(".").pop();
  }
}
