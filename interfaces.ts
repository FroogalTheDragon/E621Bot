export interface E621UrlBuilder {
  baseUrl: string;
  limit?: number;
  page?: number;
  endpoint: string;
  buildUrl(): string;
}

export interface Pool {
  id: number;
  name: string;
  url: string;
  thumbnailUrl: string;
  post_ids: string[];
}

export interface Post {
  title: string;
  id: number;
  url: string;
  previewUrl: string;
  fileType: string;
  fileSize: number;
  file: {
    ext: string;
    url: string;
    size: number;
  };
  preview: {
    url: string;
  };
  tags: Tags;
  [key: string]: Tags | string | number | File | Preview;
}

export interface Tags {
  general: string[];
  copyright: string[];
  contributor: string[];
  species: string[];
  character: string[];
  artist: string[];
  invalid: string[];
  lore: string[];
  meta: string[];
  [key: string]: string[];
}

export interface File {
  ext: string;
  url: string;
  size: number;
  [key: string]: string | number;
}

export interface Preview {
  url: string;
  [key: string]: string;
}
