# Let's get the important stuff out of the way

## This bot pulls images from a website that hosts images of all ratings, from images rated SFW to sexually explicit images to images depicting violence. As such this bot shouldn't be used by anyone under the age of 18. Also anyone contributing to this bot must be 18 years of age or older as well

## Now that that's out of the way. Hi

Hello! Welcome to the E621Bot! This is a bot that allows you to browse and share
images from the furry image hosting service [e621]("https://www.e621.net"), help
you find your favorite furry art to share with your furry friends! NMDergBot is
an inline telegram bot meaning that you communicate with it via
`@NMDergBot [query]`. You can use a simple query format. You can use my version
of the bot, which isn't always running because it's still in development or you
can use this code to run you own bot, both ways are fine.

## Searching with Keywords

This bot has a set of keywords that can be used to augment the results of your
query. They can be used anywhere in the query.

You can use these key words in combination with tags to search anything you want
on [e621]("https://www.e621.net").

- **today** - Will get you the images uploaded today
- **yesterday** - Will get you images uploaded yesterday
- **YYYY-MM-DD** - Will get you images on the date provided
- **hot** - Will get you images from the hot page
- **favcount** - Will get you images by favcount
- **score** - Will get you images by score
- **random** - Will get you random images
- **safe** - Will get you images rated **safe**
- **questionable** - Will get you images rated **questionable**
- **explicit** - Will get you images rated **explicit**

## Searching with Tags and Keywords

Just type your query like so `@NMDergBot dragon gryphon today random safe` they
are not case sensitive but must be **space seperated**!

The words **dragon**, **gryphon**, **today**, **random**, and **safe** will
return images with **dragons** and **gryphons** in them that were uploaded
**today** that are **randomly** ordered with a rating of **safe**

You can find a list of valid tags [e621]("https://www.e621.net") you can mix and
match the key words and the tags in any way you like!

## Commands

E621Bot comes with a number of commands.  These commands must be used in a direct chat with the bot.  As this bot is mostly an inline bot, you mostly interact with it by typing `@e621bot your query here` while in another chat to interact with it.  To use commands open a direct message chat with the bot, and from there you can use slash commands (`/command`).  e621Bot currently has 6 commands.

- `/start` Starts the bot
- `/help` Show a help message
- `/info` Show info about the bot
- `/hits` Show statistical info about the bot
- `/blacklist` Show your blacklisted tags
- `/edit_blacklist` Edit your blacklisted tags

## Blacklist

e621 has a **LOT** of tags, you may not be comfortable with all of them.  That's where your blacklist comes in.  You can use the blacklist to filter posts out with tags that you don't want to see.  e621 itself [has default blacklist settings](https://e621.net/help/blacklist) in place for all guest users, this is the same default blacklist the bot will start you out with when you first use the bot.

## Editing your blacklist

You can edit this default list by using `/edit_blacklist`, you will be sent your current blacklist which you can copy and past into the chat.  From there you can edit it, and send it back to the bot.  The bot will save your blacklist, and display the updated blacklist so you can verify the changes.

## How do I setup the bot?

If you want to run you own version of the bot you can download the source code.

## Make sure you have Deno installed

Once you download the source code and you have [Deno](https://deno.com/)
installed you need to make a file to store your API keys in.

## API Keys

You should have gotten an API key from the Bot Father on Telegram to run your
bot, and an E621 API key to get data from [e621](https://e621.net). Take those
two keys and stick them in a `.txt` file in any order, **nothing else should be
in the file except your the API keys!!**. You can name the text file anything
you want just remember where you put it in your file system.

## Run the Bot

After you:

- Download the source code
- Install [Deno](https://deno.com/)
- Obtain your API keys
- Create a text file containing your api keys

You are ready to run your bot! Run the helper script and point it to the text
file you created containing your keys.
`./run.sh /path/to/textfile/your_keys.txt`. The bot should not be running. Test
it by trying to run `/start` in the chat with your bot in Telegram.

## LIMITATIONS

Due to limitations in Telegram posts with the **.swf** and **.webp** file types
won't show up in the bot.

Due to limitations in Telegram bots can't send files more than **50Mb** in size;
so **.mp4** files with a file size of more than **50Mb** will send the e621 link
that points to that post, instead of the image.
