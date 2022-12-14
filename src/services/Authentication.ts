import { User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

class Authentication {
    public static generateToken(payload: User) {
        dotenv.config();
        const secret_key = process.env.JWT_SECRET_KEY
            ? process.env.JWT_SECRET_KEY
            : '';

        return jwt.sign(payload, secret_key, {
            expiresIn: '1y',
        });
    }

    public static extractTokenFromAuthorization(
        authorizationHeader: string | undefined
    ) {
        if (authorizationHeader && authorizationHeader.startsWith('Bearer ')) {
            return authorizationHeader
                .trim()
                .substring(7, authorizationHeader.length);
        }

        return false;
    }
}
export default Authentication;
