/**
 * Base e621.net URL
 */
export const baseUrl: string = "https://e621.net";

/**
 * Different endpoints on e621
 */
export const endpoint = {
  posts: "/posts.json",
  pools: "/pools.json",
};

/**
 * Pool search types
 */
export const poolSearch = {
  nameMatches: "name_matches",
  id: "id",
  descriptionMatches: "description_matches",
  creatorName: "creator_name",
  creatorId: "creator_id",
  isActive: "is_active",
  category: "category",
  order: {
    name: "name",
    createdAt: "created_at",
    updatedAt: "updated_at",
    postCount: "post_count",
  },
};

/**
 * Post ratings
 */
export const rating = { // The rating of a post or a rating to search by
  safe: "rating:s",
  questionable: "rating:q",
  explicit: "rating:e",
};

/**
 * Post filetypes
 */
export const fileType = {
  jpg: "type:jpg",
  png: "type:png",
  gif: "type:gif",
  mp4: "type:mp4",
};

/**
 * Orders to load posts in
 */
export const order = {
  score: "order:score",
  favcount: "order:favcount",
  random: "order:random",
  hot: "order%3Ahot",
};

/**
 * Date parameters to get posts by
 */
export const date = {
  today: "date:today",
  yesterday: "date:yesterday",
  byDate: "date:",
};
