import { Prisma, prisma, PrismaClient, User } from '@prisma/client';
import { Request, Response } from 'express';
import passport from 'passport';

import BaseController from '../../../absrtacts/BaseController';
import Config from '../../../Config';
import Middleware from '../../../middlewares/Middleware';
import Authentication from '../../../services/Authentication';
import Password from '../../../services/Password';
import ResponseBuilder from '../../../services/Response';
import Utils from '../../../services/Utils';
import { ResponseStatus, TSuccessResponse } from '../../../types/response';
import { LoginRequest, SignupRequest } from './auth.request';
import { TLoginResponse } from './auth.response';
import AuthSchema from './auth.schema';
import AuthService from './auth.service';

class AuthController extends BaseController {
    private authService: AuthService;
    protected paths = {
        login: Utils.apiPath('/login', ['auth']),
        signup: Utils.apiPath('/signup', ['auth']),
        dashboard: Utils.apiPath('/dashboard', ['auth']),
    };

    constructor() {
        super();
        this.authService = new AuthService();
        this.initializeRouter();
    }

    protected initializeRouter() {
        // login post
        this.router.post(
            this.paths.login,
            Middleware.bodyValidator(AuthSchema.login()),
            this.login.bind(this)
        );
        // signup post
        this.router.post(
            this.paths.signup,
            Middleware.bodyValidator(AuthSchema.signup()),
            this.signup.bind(this)
        );
        this.router.get(
            this.paths.dashboard,
            Middleware.hasRoles(['user']),
            this.dashboard
        );
    }

    protected async login(request: LoginRequest, response: Response) {
        const { email, password } = request.body;

        const user = await this.authService.checkEmailAndPassword(
            email,
            password
        );

        if (user) {
            return new ResponseBuilder<TLoginResponse>(response)
                .message(request.t('success.login'))
                .object(user)
                .exclude(['password'])
                .done();
        }

        return new ResponseBuilder<User>(response)
            .statusCode(ResponseStatus.NON_AUTHORIZED)
            .error('Check email and password')
            .done();
    }

    private async signup(request: SignupRequest, response: Response) {
        const { email, username } = request.body;

        const user = await this.authService.checkEmailAndUsername(
            email,
            username
        );

        if (user) {
            return new ResponseBuilder(response)
                .statusCode(ResponseStatus.VALIDATION)
                .error(
                    'Please provide us with a new email, your email is existed in our database'
                )
                .done();
        }

        const signedUser = await this.authService.createUserAndGetToken(
            request.body
        );

        if (!signedUser) {
            return new ResponseBuilder(response)
                .statusCode(ResponseStatus.VALIDATION)
                .error('Error happened while creating your account')
                .done();
        }

        return new ResponseBuilder<TLoginResponse>(response)
            .message('Account created successfully')
            .object(signedUser)
            .done();
    }

    private dashboard(request: Request, response: Response) {
        response.send('Dashboard Route');
    }
}

export default AuthController;
