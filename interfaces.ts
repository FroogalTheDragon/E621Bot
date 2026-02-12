export interface E621UrlBuilder {
  baseUrl: string;
  limit?: number;
  page?: number;
  endpoint: string;
  buildUrl(rating?: string): string;
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

export interface Config {
  db: {
    base_directory: string;
    prod: string;
    test: string;
    db_file: string;
    test_db_file: string;
  };
  key_file: string;
}

export interface Keys {
  keys: {
    bot?: string, // Nullable becuase Deno.env.get() can return string | undefined
    e621?: string // Same ^
  }
}
