# Let's get the important stuff out of the way!

**This bot pulls images from a website that hosts images of all ratings from Safe For Work to Sexually Explicit images depicting violence.  As such this bot shouldn't be used by anyone under the age of 18.  Also anyone contributing to this bot must be 18 years of age or older as well!!**

# Now that that's out of the way.  Hi!

Hello!  Welcome to the NMDergBot!  This is a bot that allows you to browse and share images from the furry image hosting service [e621]("https://www.e621.net"), help you find your favorite furry art to share with your furry friends!
NMDergBot is an inline telegram bot meaning that you communicate with it via `@NMDergBot [query]`.  You can use a simple query format to search with this bot as follows:
  
# Searching with Keywords:

This bot has a set of keywords that can be used to augment the results of your query.  They can be used anywhere in the query.

You can use these key words in combination with tags to search anything you want on [e621]("https://www.e621.net").

**today** - Will get you the images uploaded today
**yesterday** - Will get you images uploaded yesterday
**YYYY-MM-DD**</u></b>** - Will get you images on the date provided
**hot** - Will get you images from the hot page
**favcount** - Will get you images by favcount
**score** - Will get you images by score
**random** - Will get you random images
**safe** - Will get you images rated **safe**
**questionable** - Will get you images rated **questionable**
**explicit** - Will get you images rated **explicit**

# Searching with Tags and Keywords:

Just type your query like so `@NMDergBot dragon gryphon today random safe` they are not case sensitive but must be **space seperated**!

The words **dragon**, **gryphon**, **today**, **random**, and **safe** will return images with **dragons** and **gryphons** in them that were uploaded **today** that are **randomly** ordered with a rating of **safe**

You can find a list of valid tags [e621]("https://www.e621.net") you can mix and match the key words and the tags in any way you like!

# How do I setup the bot?
If you want to run you own version of the bot you can download the source code.

## Make sure you have Deno installed!
Once you download the source code and you have [Deno](https://deno.com/) installed you need to make a file to store your API keys in.

## API Keys
You should have gotten an API key from the Bot Father on Telegram to run your bot, and an E621 API key to get data from [e621](https://e621.net).  Take those two keys and stick them in a `.txt` file in any order, **nothing else should be in the file except your the API keys!!**.  You can name the text file anything you want just remember where you put it in your file system.

## Run the Bot
After you:
* Download the source code
* Install [Deno](https://deno.com/)
* Obtain your API keys
* Create a text file containing your api keys

 You are ready to run your bot!  Run the helper script and point it to the text file you created containing your keys.  `./run.sh /path/to/textfile/your_keys.txt`.  The bot should not be running.  Test it by trying to run `/start` in the chat with your bot in Telegram.