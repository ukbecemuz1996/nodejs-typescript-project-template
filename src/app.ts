import express, { Application } from 'express';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import passport from 'passport';
import BaseController from './absrtacts/BaseController';
import { PrismaClient } from '@prisma/client';
import Middleware from './middlewares/Middleware';
import I18nextMiddleware from 'i18next-http-middleware';
import i18next from './i18n';
import RedisClient from './services/Redis';

class App {
    private app: Application = express();
    private controllers: BaseController[] = [];

    constructor(controllers: BaseController[]) {
        this.controllers = controllers;
        this.init();
    }

    private init(): void {
        this.initializeMiddlewares();
        this.initializeControllers();

        process.on('unhandledRejection', (reason, promise) => {
            console.error(
                'Unhandled Rejection at:',
                promise,
                'reason:',
                reason
            );
            throw reason;
        });

        process.on('uncaughtException', (err) => {
            const error = { message: err.message, stack: err.stack };
            console.error(error);
        });
    }

    public registerController(controller: BaseController): void {
        if (controller) {
            this.controllers.push(controller);
            this.app.use('/', controller.getRouter());
        }
    }

    private initializeControllers() {
        this.controllers.forEach((controller) => {
            this.app.use('/', controller.getRouter());
        });
    }

    private initializeMiddlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(Middleware.errorHandler());
        this.app.use(Middleware.checkJWTBlacklist());
        this.app.use(I18nextMiddleware.handle(i18next));
        // this.initPassport();
    }

    private initPassport() {
        const prisma = new PrismaClient();
        passport.use(
            new JwtStrategy(
                {
                    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
                    secretOrKey: process.env.JWT_SECRET_KEY,
                },
                async (payload, done) => {
                    return prisma.user
                        .findUnique({
                            where: {
                                id: payload.id,
                            },
                        })
                        .then((user) => done(null, user || false))
                        .catch((err) => done(err));
                }
            )
        );
    }

    public getApp(): Application {
        return this.app;
    }
}

export default App;
