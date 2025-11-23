export interface E621UrlBuilder {
    baseUrl: string;
    limit?: number;
    page?: number;
    endpoint: string;
    buildUrl(): string;
}