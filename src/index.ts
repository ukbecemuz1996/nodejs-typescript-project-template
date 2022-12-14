import dotenv from "dotenv";
import http from "http";
import AuthController from "./api/v1/auth/auth.controller";
import App from "./app";

// load environment variables
dotenv.config();

// port from .env
const port = process.env.PORT;

// set app port 
const app  = new App(
    [
        new AuthController()
    ]
);

// create http server from express app
const server = http.createServer(app.getApp());

// server listen on ${process.env.PORT}
server.listen(port,()=> {
    console.log(`server is up on http://localhost:${port}`);
})