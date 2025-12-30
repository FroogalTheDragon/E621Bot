export const startString = `
Bot Started <b>This is an <u>Explicit 18+</u> bot</b> and should only be used by <b>Those who are <u>18 years old or above</u></b> run /info for more information about this bot!
`;

export const helpString = `
Hello!  Welcome to the NMDergBot!  This is a bot that allows you to browse and share images from the furry image hosting service <a href="https://www.e621.net">e621</a>, it can help you find your favorite furry art to share with your furry friends!

NMDergBot is an inline telegram bot meaning that you communicate with it via @NMDergBot [query].

This bot has a set of keywords that can be used to augment the results of your query.  They can be used anywhere in the query.
  
<b>Keywords:</b>
<b><u>today</u></b> - Will get you the images uploaded today
<b><u>yesterday</u></b> - Will get you images uploaded yesterday
<b><u>YYYY-MM-DD</u></b> - Will get you images on the date provided
<b><u>hot</u></b> - Will get you images from the hot page
<b><u>favcount</u></b> - Will get you images by favcount
<b><u>score</u></b> - Will get you images by score
<b><u>random</u></b> - Will get you random images
<b><u>safe</u></b> - Will get you images rated <b><u>safe</u></b>
<b><u>questionable</u></b> - Will get you images rated <b><u>questionable</u></b>
<b><u>explicit</u></b> - Will get you images rated <b><u>explicit</u></b>

You can use these key words in combination with tags to search anything you want on <a href="https://www.e621.net">e621</a>.

Just type your query like so [@NMDergBot dragon gryphon today random safe] they are not case sensitive but must be <b>space seperated</b>!

The words dragon, gryphon, today, random, and safe will return images with <b><u>dragons</u></b> and <b><u>gryphons</u></b> in them that were uploaded <b><u>today</u></b> that are <b><u>randomly</u></b> ordered with a rating of <b><u>safe</u></b>

You can find a list of valid tags <a href="https://e621.net/tags">here</a> you can mix and match the key words and the tags in any way you like!

<b><u>LIMITATIONS!!</u></b>
Due to limitations in Telegram posts with the <b>.swf</b> and <b>.webp</b> file types won't show up in the bot.

Due to limitations in Telegram bots can't send files more than 50Mb in size; so <b>.mp4</b> files with a file size of more than 50Mb will send the e621 link that points to that post, instead of the image.
`;

export const infoString = `
This is the Yiff bot, use this bot to find the latest and greatest furry images from the interwebz.\n
<b>It's important to know that a lot of these images are rated <u>EXPLICIT</u> and so this bot should not be used by anyone under the age of 18.</b>
`;

export const fileTypes = {
  jpg: "jpg",
  png: "png",
  gif: "gif",
  mp4: "mp4",
  webm: "webm",
};

export const keywordsRegex = "(id|creator|active|inactive|category|order)";
export const BLACKLIST_PATH = "./blacklist.txt";
export const defaultBlacklist =
  "gore,scat,watersports,young,-rating:s,loli,shota";

// DB strings
export const SQL_BASEPATH = "db/sql";
export const DB_FILE = "db/prod_db/blacklist.db";
export const TEST_DB_FILE = "db/test_db/blacklist_test.db";
