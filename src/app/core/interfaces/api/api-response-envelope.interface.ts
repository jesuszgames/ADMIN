export interface ApiResponseEnvelope<T> {
    statusCode: number;
    status: string;
    message: string;
    data: T;
}
