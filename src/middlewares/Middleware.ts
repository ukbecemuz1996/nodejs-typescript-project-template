import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import ResponseBuilder from '../services/Response';
import { ResponseStatus } from '../types/response';
import passport from 'passport';
import Authentication from '../services/Authentication';
import { TPayloadType } from '../types/prisma';
import AuthService from '../api/v1/auth/auth.service';
import RedisClient from '../services/Redis';
import { User } from '@prisma/client';

class Middleware {
    public static errorHandler() {
        return (err: any, req: Request, res: Response, next: NextFunction) => {
            if (err) {
                console.log(err.stack);

                return new ResponseBuilder(res)
                    .statusCode(ResponseStatus.SERVER_ERROR)
                    .error(err.message)
                    .done();
            }
        };
    }
    public static bodyValidator(schema: Joi.AnySchema) {
        return (req: Request, res: Response, next: NextFunction) => {
            const { body } = req;
            const { error } = schema.validate(body);

            console.log({
                body,
                error,
            });

            if (error) {
                return new ResponseBuilder(res)
                    .statusCode(ResponseStatus.VALIDATION)
                    .error(error.message)
                    .done();
            }

            return next();
        };
    }

    // public static isAuthenticated() {
    //     return passport.authenticate('jwt', { session: false });
    // }

    public static hasPermissions(permissions: string[]) {
        return (req: Request, res: Response, next: NextFunction) => {};
    }

    public static hasRoles(roles: string[]) {
        return async (req: Request, res: Response, next: NextFunction) => {
            // Get authorization header from request
            const authorization = req.get('authorization');

            // extract token text from bearer prefixed string
            const token =
                Authentication.extractTokenFromAuthorization(authorization);

            // if there is an error on token return error
            if (!token) {
                return new ResponseBuilder(res)
                    .statusCode(ResponseStatus.NON_AUTHORIZED)
                    .error('Token Issues')
                    .done();
            }

            // trying verify token and if there is error on verifying return error
            try {
                // verify token and return payload of type (User & JwtPayload)

                const user = <TPayloadType>(
                    jwt.verify(token, process.env.JWT_SECRET_KEY || '')
                );

                // check if given roles existed in current user roles using AuthService
                const authService = new AuthService();
                const found = await authService.userhaveRoles(user.id, roles);

                // if current user doesn`t have given roles retur error
                if (!found) {
                    return new ResponseBuilder(res)
                        .statusCode(ResponseStatus.NON_AUTHORIZED)
                        .error('Not Authorized')
                        .done();
                }

                return next();
            } catch (error: any) {
                return new ResponseBuilder(res)
                    .statusCode(ResponseStatus.NON_AUTHORIZED)
                    .error(error.message)
                    .done();
            }
        };
    }

    public static isAuthenticated() {
        return async (req: Request, res: Response, next: NextFunction) => {
            // Get authorization header from request
            const authorization = req.get('authorization');

            // extract token text from bearer prefixed string
            const token =
                Authentication.extractTokenFromAuthorization(authorization);

            // if there is an error on token return error
            if (!token) {
                return new ResponseBuilder(res)
                    .statusCode(ResponseStatus.NON_AUTHORIZED)
                    .error('Please provide us your token')
                    .done();
            }

            // trying verify token and if there is error on verifying return error
            try {
                // verify token and return payload of type (User & JwtPayload)

                const user = <User>(
                    jwt.verify(token, process.env.JWT_SECRET_KEY || '')
                );

                // if current user doesn`t have given roles return error
                if (!user) {
                    return new ResponseBuilder(res)
                        .statusCode(ResponseStatus.NON_AUTHORIZED)
                        .error('Not Authorized')
                        .done();
                }

                res.locals.user = user;
                res.locals.token = token;

                return next();
            } catch (error: any) {
                return new ResponseBuilder(res)
                    .statusCode(ResponseStatus.NON_AUTHORIZED)
                    .error(error.message)
                    .done();
            }
        };
    }

    public static checkJWTBlacklist() {
        return async (req: Request, res: Response, next: NextFunction) => {
            // Get authorization header from request
            const authorization = req.get('authorization');

            // extract token text from bearer prefixed string
            const token =
                Authentication.extractTokenFromAuthorization(authorization);

            // if token is existed search token in redis blacklist
            if (token) {
                const client = RedisClient.getInstance();
                if (!client.isOpen) await client.connect();
                const jwtBlacklist = await client.json.arrIndex(
                    'jwt-blacklist',
                    '.',
                    {
                        token,
                    }
                );

                // if token is existed in blacklist then check for expiration date
                if (!Array.isArray(jwtBlacklist) && jwtBlacklist !== -1) {
                    // try verfying token for date expiration
                    try {
                        jwt.verify(token, process.env.JWT_SECRET_KEY || '');
                    } catch (error: any) {
                        // if token is expired then delete this token from blacklist
                        await client.json.arrPop(
                            'jwt-blacklist',
                            '.',
                            jwtBlacklist
                        );
                    } finally {
                        // return token expired error
                        return new ResponseBuilder(res)
                            .statusCode(ResponseStatus.NON_AUTHORIZED)
                            .error('Your token is expired')
                            .done();
                    }
                }
            }

            next();
        };
    }
}

export default Middleware;
