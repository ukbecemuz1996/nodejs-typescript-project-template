import { PrismaClient } from '@prisma/client';
import Password from './services/Password';

const prisma = new PrismaClient();

async function main() {
    const admin = await prisma.role.upsert({
        where: { name: 'admin' },
        update: {},
        create: {
            name: 'admin',
            description: 'Admin Of Timetracker application',
        },
    });

    const user = await prisma.role.upsert({
        where: { name: 'user' },
        update: {},
        create: {
            name: 'user',
            description: 'User of Timetracker Application',
        },
    });

    const okba = await prisma.user.upsert({
        where: { email: 'okba.cemuz@gmail.com' },
        update: {},
        create: {
            email: 'okba.cemuz@gmail.com',
            first_name: 'Okba',
            last_name: 'CEMUZ',
            password: await new Password('123456').hashPassword(),
            username: 'okba1995',
            roles: {
                create: [
                    {
                        role: {
                            connect: {
                                id: admin.id,
                            },
                        },
                    },
                ],
            },
        },
    });

    console.log({ admin, okba, user });
}
main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
