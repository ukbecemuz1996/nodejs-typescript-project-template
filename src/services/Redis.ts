import { createClient, RedisClientType } from 'redis';

class RedisClient {
    private static instance: RedisClientType;

    private constructor() {
        console.log(RedisClient.instance);
    }

    public static getInstance(): RedisClientType {
        if (!RedisClient.instance) {
            RedisClient.instance = createClient({
                url: process.env.REDIS_URL,
                // port: Number.parseInt(process.env.REDIS_PORT || ''),
                password: process.env.REDIS_PASSWORD,
            });
        }

        return RedisClient.instance;
    }
}
export default RedisClient;
