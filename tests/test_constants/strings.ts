import config from "../../config.json" with { type: "json" };

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

<b><u>Commands</u></b>
E621Bot comes with a number of commands.  These commands must be used in a direct chat with the bot.  As this bot is mostly an inline bot, you mostly interact with it by typing <code>@e621bot your query here</code> while in another chat to interact with it.  To use commands open a direct message chat with the bot, and from there you can use slash commands (<code>/command</code>).  e621Bot currently has 6 commands.

<b><code>/start</code></b> Starts the bot
<b><code>/help</code></b> Show a help message
<b><code>/info</code></b> Show info about the bot
<b><code>/hits</code></b> Show statistical info about the bot
<b><code>/blacklist</code></b> Show your blacklisted tags
<b><code>/edit_blacklist</code></b> Edit your blacklisted tags

<b><u>Blacklist</u></b>
e621 has a <b>LOT</b> of tags, you may not be comfortable with all of them.  That's where your blacklist comes in!  You can use the blacklist to filter posts out with tags that you don't want to see.  e621 itself <a href="https://e621.net/help/blacklist">has default blacklist settings]</a> in place for all guest users, this is the same default blacklist the bot will start you out with when you first use the bot.

<b><u>Editing your blacklist</u></b>
You can edit this default list by using <code>/edit_blacklist</code>, you will be sent your current blacklist which you can copy and paste into the chat.  From there you can edit it, and send it back to the bot.  The bot will save your blacklist, and display the updated blacklist so you can verify the changes.

<b><u>LIMITATIONS!!</u></b>
Due to limitations in Telegram posts with the <b>.swf</b> and <b>.webp</b> file types won't show up in the bot.

Due to limitations in Telegram bots can't send files more than 50Mb in size; so <b>.mp4</b> files with a file size of more than 50Mb will send the e621 link that points to that post, instead of the image.
`;

export const infoString = `
This is the e621 bot, use this bot to find the latest and greatest furry images from the interwebz.\n
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
export const DB_BASEPATH = Deno.realPathSync(config.db.base_directory);
export const DB_FILE = Deno.realPathSync(config.db.db_file);
export const TEST_DB_FILE = Deno.realPathSync("db/test_db/user_test.db");
