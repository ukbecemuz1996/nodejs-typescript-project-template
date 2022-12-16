import { User } from '@prisma/client';
import { Request, Response } from 'express';
import { ObjectBindingOrAssignmentElement } from 'typescript';
import BaseController from '../../../absrtacts/BaseController';
import Middleware from '../../../middlewares/Middleware';
import Authentication from '../../../services/Authentication';
import RedisClient from '../../../services/Redis';
import ResponseBuilder from '../../../services/Response';
import Utils from '../../../services/Utils';
import { ResponseStatus } from '../../../types/response';
import { LoginRequest, SignupRequest } from './auth.request';
import { TLoginResponse } from './auth.response';
import AuthSchema from './auth.schema';
import AuthService from './auth.service';

class AuthController extends BaseController {
    private authService: AuthService;
    private authSchema: AuthSchema;
    protected paths = {
        login: Utils.apiPath('/login', ['auth']),
        signup: Utils.apiPath('/signup', ['auth']),
        logout: Utils.apiPath('/logout', ['auth']),
        dashboard: Utils.apiPath('/dashboard', ['auth']),
    };

    constructor() {
        super();
        this.authService = new AuthService();
        this.authSchema = new AuthSchema();
        this.initializeRouter();
    }

    protected initializeRouter() {
        // login post
        this.router.post(
            this.paths.login,
            Middleware.bodyValidator(this.authSchema.login()),
            this.login.bind(this)
        );
        // signup post
        this.router.post(
            this.paths.signup,
            Middleware.bodyValidator(this.authSchema.signup()),
            this.signup.bind(this)
        );

        // signup post
        this.router.post(
            this.paths.logout,
            Middleware.isAuthenticated(),
            this.logout.bind(this)
        );

        this.router.get(
            this.paths.dashboard,
            Middleware.isAuthenticated(),
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
        console.log(response.locals.user);

        response.send('Dashboard Route');
    }

    private async logout(request: Request, response: Response) {
        const authorization = request.get('authorization');
        const token =
            Authentication.extractTokenFromAuthorization(authorization);
        if (!token) {
            return new ResponseBuilder(response)
                .statusCode(ResponseStatus.NON_AUTHORIZED)
                .error('You can`t logout please provide your token')
                .done();
        }

        const client = RedisClient.getInstance();
        if (!client.isOpen) await client.connect();
        const jwtBlacklist = await client.json.get('jwt-blacklist');
        if (jwtBlacklist) {
            await client.json.arrAppend('jwt-blacklist', '.', { token });
        } else {
            await client.json.set('jwt-blacklist', '.', [{ token }]);
        }

        return new ResponseBuilder<Object>(response)
            .message('See you again')
            .object({})
            .done();
    }
}

export default AuthController;
