import { NextFunction, Request, Response } from 'express';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import ResponseBuilder from '../services/Response';
import { ResponseStatus } from '../types/response';
import passport from 'passport';
import Authentication from '../services/Authentication';
import { TPayloadType } from '../types/prisma';
import AuthService from '../api/v1/auth/auth.service';

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

    public static isAuthenticated() {
        return passport.authenticate('jwt', { session: false });
    }

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
}

export default Middleware;
