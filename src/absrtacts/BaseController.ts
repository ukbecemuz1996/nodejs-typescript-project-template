import { PrismaClient } from '@prisma/client';
import { Router } from 'express';

abstract class BaseController {
    protected router: Router = Router();
    protected paths: { [key: string]: string };
    protected prisma: PrismaClient;

    constructor() {
        this.prisma = new PrismaClient();
    }
    protected abstract initializeRouter(): void;

    public getRouter(): Router {
        return this.router;
    }

    public getPaths() {
        parent
        return this.paths;
    }

    protected exclude<T>(model: T, keys: (keyof T)[]) {
        for (let key of keys) {
            delete model[key];
        }
        return model;
    }
}

export default BaseController;
