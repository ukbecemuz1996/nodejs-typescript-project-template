import { Prisma, User, UserToRole } from '@prisma/client';
import { JwtPayload } from 'jsonwebtoken';

const userWithRoles = Prisma.validator<Prisma.UserArgs>()({
    select: {
        roles: {
            include: {
                role: true,
            },
        },
    },
});

export type TUserWithRoles = Prisma.UserGetPayload<typeof userWithRoles>;

export type TPayloadType = TUserWithRoles & JwtPayload;
