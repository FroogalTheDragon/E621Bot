#!/usr/bin/env bash
file="$1";
run="$2";

declare -a keys;

# Get the api keys
function get_keys() {
    if [ ! -f "$file" ]; then
        echo "File not found!: $file";
        return 1;
    fi
        
    line_number=0;
    while read -r line; do
        keys[line_number]="$line";
        (( line_number+=1 ));
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

function printHelp() {
    echo "";
    echo "";
    echo "";
}

if [ ! "$file" ]; then
    echo "No key file passed, exitting.";
    exit 1;
fi

# Get keys
if ! get_keys; then
    echo "Failed to extract keys from file path provided!  Failed to start bot.";
    exit 1;
fi

# Setup the environment variables
if ! setup_env; then
    echo "Failed to setup environment variables!  Failed to start bot.";
    exit 1;
fi

# Process args
case $run in
    "dev") deno run dev;;
    "test") deno run test;;
    "bin") deno run bin;; # Build a binary in ./bin
    "bin-arm") deno run deno bin-arm;;
    "help") printHelp;;
    *) echo "Invalid option detected: $run, Expecting on of these arguments: [dev, test, bin, bin-arm]";;
esac