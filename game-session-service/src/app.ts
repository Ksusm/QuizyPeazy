import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger";
import sessionController from "./controllers/session.controller";
import { apiErrorHandler } from "./middleware/error.middleware";
import { authMiddleware } from "./middleware/auth.middleware";
import mongo from "./database/mongo";

export const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get('/health', (req, res) => res.sendStatus(200));

server.post('/sessions', authMiddleware, async (req, res, next) => {
    try {
        await sessionController.create(req, res);
    } catch (error) {
        next(error);
    }
});

server.get('/sessions/:roomCode', async (req, res, next) => {
    try {
        await sessionController.findByRoomCode(req, res);
    } catch (error) {
        next(error);
    }
});

server.post('/sessions/:roomCode/join', async (req, res, next) => {
    try {
        await sessionController.join(req, res);
    } catch (error) {
        next(error);
    }
});

server.post('/sessions/:roomCode/start', authMiddleware, async (req, res, next) => {
    try {
        await sessionController.start(req, res);
    } catch (error) {
        next(error);
    }
});

server.post('/sessions/:roomCode/answer', async (req, res, next) => {
    try {
        await sessionController.submitAnswer(req, res);
    } catch (error) {
        next(error);
    }
});

server.delete('/sessions/:roomCode', authMiddleware, async (req, res, next) => {
    try {
        await sessionController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

server.use(apiErrorHandler);

const PORT = process.env.PORT || 3003;

async function start() {
    console.log("Connecting to Mongo...");
    await mongo.connect();

    server.listen(PORT, () => {
        console.log(`Game Session Service running on port ${PORT}`);
        console.log(`API Docs: http://localhost:${PORT}/api-docs`);
    });
}

if (process.env.NODE_ENV !== 'test') {
    start();
}