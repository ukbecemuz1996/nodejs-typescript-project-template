import { Request } from 'express';

export type TLoginRequestBody = {
    email: string;
    password: string;
};

export type TSignupRequestBody = {
    email: string;
    first_name: string;
    last_name: string;
    username: string;
    password: string;
};

export type TLoginRequestQuery = {};
export type TSignupRequestQuery = {};

export interface LoginRequest
    extends Request<any, any, TLoginRequestBody, TLoginRequestQuery> {}

export interface SignupRequest
    extends Request<any, any, TSignupRequestBody, TSignupRequestQuery> {}
