#!/usr/bin/env bash
file="$1";
run="$2";

declare -a keys;
declare -i code;

# Get the api keys
function get_keys() {
    if [ ! -f $file ]; then
        echo "File not found!: $file";
        return 1;
    fi
        
    line_number=0;
    while read line; do
        keys[line_number]="$line";
        line_number+=1;
    done < "$file";
}

# Setup the environment variables based on the keys found in the passed file
function setup_env() {
    if [ ${#keys[0]} -gt ${#keys[1]} ]; then # The telegram key is shorter than the e621 key this is so it doesnt matter the order you put the keys in the file
        export TELEGRAM_BOT_KEY=${keys[0]};
        export E621_API_KEY=${keys[1]};
    else
        export TELEGRAM_BOT_KEY=${keys[1]};
        export E621_API_KEY=${keys[0]};
    fi
}

if [ ! $file ]; then
    echo "No key file passed, exitting.";
    exit 1;
fi

# Get keys
get_keys;
if [ $? != 0 ]; then
    echo "Failed to extract keys from file path provided!  Failed to start bot.";
    exit 1;
fi

# Setup the environment variables
setup_env;
if [ $? != 0 ]; then
    echo "Failed to setup environment variables!  Failed to start bot.";
    exit 1;
fi

# Process args
case $run in
    "dev") deno run dev;;
    "test") deno run test;;
    "bin") deno run bin; ./E621Bot;;
    *) echo "Invalid option detected: $run, Expecting bin, dev, or test";;
esac