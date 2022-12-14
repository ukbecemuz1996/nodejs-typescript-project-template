import dotenv from 'dotenv';
import http from 'http';
import AuthController from './api/v1/auth/auth.controller';
import App from './app';

// load environment variables
dotenv.config();

// port from .env
const port = process.env.PORT;

// set app port
const app = new App([new AuthController()]);

// create http server from express app
const server = http.createServer(app.getApp());

// server listen on ${process.env.PORT}
server.listen(port, () => {
    console.log(`server is up on http://localhost:${port}`);
});

server.on('request', () => {
    const arr = [1, 2, 3, 4, 5, 6, 9, 7, 8, 9, 10];
    arr.reverse();
    const used: any = process.memoryUsage();
    for (let key in used) {
        console.log(
            `${key} ${Math.round((used[key] / 1024 / 1024) * 100) / 100} MB`
        );
    }
});
