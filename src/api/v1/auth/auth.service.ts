import { Prisma, PrismaClient, User } from '@prisma/client';
import Authentication from '../../../services/Authentication';
import Password from '../../../services/Password';
import Utils from '../../../services/Utils';
import { TSignupRequestBody } from './auth.request';
import { TLoginResponse } from './auth.response';

class AuthService {
    private prisma: PrismaClient = new PrismaClient();

    public async userhaveRoles(userId: string, roles: string[]) {
        return await this.prisma.user.findFirst({
            where: {
                id: userId,
                roles: {
                    every: {
                        role: {
                            name: {
                                in: roles,
                            },
                        },
                    },
                },
            },
        });
    }

    public async checkEmailAndPassword(email: string, password: string) {
        const userWhere: Prisma.UserWhereInput = {
            email,
        };

        let user = await this.prisma.user.findFirst({
            where: userWhere,
        });

        if (user) {
            const passwordMatch = await Password.checkPassword(
                password,
                user?.password
            );

            if (passwordMatch) {
                const userWithoutPassword = Utils.exclude<User>(user, [
                    'password',
                ]);
                const token = Authentication.generateToken(userWithoutPassword);
                const result: TLoginResponse = {
                    ...userWithoutPassword,
                    token,
                };
                return result;
            }
        }

        return null;
    }

    public async checkEmailAndUsername(email: string, username: string) {
        const userWhere: Prisma.UserWhereInput = {
            OR: [{ email }, { username }],
        };

        let user = await this.prisma.user.findFirst({
            where: userWhere,
        });

        console.log(user);

        return user;
    }

    public async createUserAndGetToken(input: TSignupRequestBody) {
        const password = new Password(input.password);
        const hashedPassword = await password.hashPassword();

        const user = await this.prisma.user.create({
            data: {
                first_name: input.first_name,
                last_name: input.last_name,
                email: input.email,
                username: input.username,
                password: hashedPassword,
                roles: {
                    create: {
                        role: {
                            connect: {
                                name: 'user',
                            },
                        },
                    },
                },
            },
        });

        if (user) {
            const userWithoutPassword = Utils.exclude<User>(user, ['password']);
            const token = Authentication.generateToken(userWithoutPassword);
            const result: TLoginResponse = { ...userWithoutPassword, token };
            return result;
        }

        return null;
    }
}
export default AuthService;
