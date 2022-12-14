import Joi from 'joi';

export interface IValidation {
    options?: IValidationOptions;
    body?: Joi.SchemaLike;
    headers?: Joi.SchemaLike;
    query?: Joi.SchemaLike;
    cookies?: Joi.SchemaLike;
    params?: Joi.SchemaLike;
}

export interface IValidationOptions {
    allowUnknownBody?: boolean;
    allowUnknownQuery?: boolean;
    allowUnknownHeaders?: boolean;
    allowUnknownParams?: boolean;
    allowUnknownCookies?: boolean;
    JoiOptions?: Joi.ValidationOptions;
}
