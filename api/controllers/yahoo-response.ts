export interface YahooResponse {
    meta: {
        version: string;
    }
    body: {
        quoteType: string;
        shortName: string;
        longName: string;
    }
}