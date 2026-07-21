export interface ApiPaginatedResponse<T> {
    data: {
        content: T;
        totalPages: number;
        totalElements: number;
        size: number;
        number: number;
        first: boolean;
        last: boolean;
    };
}

export interface ApiResponse<T> {
    data: T,
    status: boolean,
    message: string
}

export type Option = {
    label: string;
    value: number;
};