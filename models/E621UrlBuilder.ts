export interface E621UrlBuilder {
    baseUrl: string;
    limit?: number;
    endpoint: string;
    buildUrl(): string;
}