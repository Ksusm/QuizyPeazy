import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger";
import authController from "./controllers/auth.controller";
import { apiErrorHandler } from "./middleware/error.middleware";
import { oAuthModel } from "./middleware/auth.middleware";
import mongo from "./database/mongo";
import cors from "cors";

const ExpressOAuthServer = require('@node-oauth/express-oauth-server');

export const server = express();

server.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
console.log('Allowed CORS for', process.env.CORS_ORIGIN);

// OAuth Server setup
const oauth = new ExpressOAuthServer({ model: oAuthModel });

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get('/health', (req, res) => res.sendStatus(200));

server.post('/auth/register', async (req, res, next) => {
    try {
        await authController.register(req, res);
    } catch (error) {
        next(error);
    }
});

server.post('/auth/login', async (req, res, next) => {
    try {
        await authController.login(req, res);
    } catch (error) {
        next(error);
    }
});

server.get('/auth/profile/:id', oauth.authenticate(), async (req, res, next) => {
    try {
        await authController.getProfile(req, res);
    } catch (error) {
        next(error);
    }
});

server.put('/auth/profile/:id', oauth.authenticate(), async (req, res, next) => {
    try {
        await authController.updateProfile(req, res);
    } catch (error) {
        next(error);
    }
});

server.post('/verify-token', async (req, res, next) => {
    try {
        await authController.verifyToken(req, res);
    } catch (error) {
        next(error);
    }
});

server.delete('/auth/users/:id', oauth.authenticate(), async (req, res, next) => {
    try {
        await authController.deleteUser(req, res);
    } catch (error) {
        next(error);
    }
});

server.use(apiErrorHandler);

// Start server
const PORT = process.env.PORT || 3001;

async function start() {
    console.log("Connecting to Mongo...");
    await mongo.connect();

    server.listen(PORT, () => {
        console.log(`Auth Service running on port ${PORT}`);
        console.log(`API Docs: http://localhost:${PORT}/api-docs`);
    });
}

start();