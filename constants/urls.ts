export const baseUrl: string = "https://e621.net/posts";
export const baseUrlTags: string = baseUrl.concat(".json"); // Base e621 url
export const rating = { // The rating of a post or a rating to search by
    safe: "rating:s",
    questionable: "rating:q",
    explicit: "rating:e"
};
export const fileType = {
    jpg: "type:jpg",
    png: "type:png",
    gif: "type:gif",
    mp4: "type:mp4"
};
export const order = {
    score: "order:score",
    favcount: "order:favcount",
    random: "order:random",
    hot: "order%3Ahot"
}
export const date = {
    today: "date:today",
    yesterday: "date:yesterday",
    byDate: "date:"
}
