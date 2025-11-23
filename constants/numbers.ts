/**
 * Max number of images Telegram can load at a time
 */
export const IMAGE_LOAD_COUNT: number = 50;

/**
 * Max file size in megabytes that the bot can upload (Limit set by Telegram)
 */
export const MAX_FILE_SIZE: number = 50;

/**
 * Maximum number of posts the bot can pull per request
 */
export const API_PAGE_SIZE = 100;

/**
 * Amount of time in seconds the bot caches posts
 */
export const POSTS_CACHE_TIME = 300;

/**
 * Maximum pools a the bot will pull per request
 */
export const POOLS_PAGE_SIZE = 5;

/**
 * Number of pools to load in the inline query
 */
export const POOLS_INLINE_LOAD_COUNT = 3;

/**
 * Amount of time in seconds the bot caches pools
 */
export const POOLS_CACHE_TIME = 0;

/**
 * The binary equivalent of 1 Megabyte
 */
export const ONE_MEGABYTE = 1_048_576

/**
 * How long to wait between sending GET requests in milliseconds
 */
export const REQUEST_TIME_LIMIT = 1000;

/**
 * How many blacklisted posts in a row that must be loaded until the query closes
 */
export const BLACKLIST_MAX_HITS = 500;
