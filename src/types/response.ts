import { User } from "@prisma/client";

export enum ResponseStatus {
    VALIDATION = 400,
    NON_AUTHORIZED = 401,
    NOT_FOUND = 404,
    SUCCESS = 200,
    SERVER_ERROR = 500,
}

export enum CRUD {
    CREATE = 'CREATE',
    READ = 'CREATE',
    UPDATE = 'CREATE',
    DELETE = 'CREATE',
}

export type TSuccessResponse<T> = {
    message: string;
    data: T;
};

export type TPage = {
    page: number;
    per_page: number;
    total: number;
};

export type TPaginated<T> = {
    page: number;
    per_page: number;
    total: number;
    data: T[];
};

export type TPaginatedSuccessResponse<T> = TPaginated<T> &
    Omit<TSuccessResponse<T>, 'data'>;

export type TErrorResponse = {
    error: string;
};
