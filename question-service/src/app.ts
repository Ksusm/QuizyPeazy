import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./utils/swagger";
import questionController from "./controllers/question.controller";
import { apiErrorHandler } from "./middleware/error.middleware";
import { authMiddleware, hasAnyRole } from "./middleware/auth.middleware";
import mongo from "./database/mongo";
import cors from "cors";

export const server = express();

server.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
}));
console.log('Allowed CORS for', process.env.CORS_ORIGIN);

// Middleware
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get('/health', (req, res) => res.sendStatus(200));

server.get('/questions', async (req, res, next) => {
    try {
        await questionController.findAll(req, res);
    } catch (error) {
        next(error);
    }
});

server.get('/questions/:id', async (req, res, next) => {
    try {
        await questionController.findById(req, res);
    } catch (error) {
        next(error);
    }
});

server.post('/questions', authMiddleware, hasAnyRole('ADMIN'), async (req, res, next) => {
    try {
        await questionController.create(req, res);
    } catch (error) {
        next(error);
    }
});

server.put('/questions/:id', authMiddleware, hasAnyRole('ADMIN'), async (req, res, next) => {
    try {
        await questionController.update(req, res);
    } catch (error) {
        next(error);
    }
});

server.delete('/questions/:id', authMiddleware, hasAnyRole('ADMIN'), async (req, res, next) => {
    try {
        await questionController.delete(req, res);
    } catch (error) {
        next(error);
    }
});

server.use(apiErrorHandler);

// Start server
const PORT = process.env.PORT || 3002;

async function start() {
    console.log("Connecting to Mongo...");
    await mongo.connect();

    server.listen(PORT, () => {
        console.log(`Question Service running on port ${PORT}`);
        console.log(`API Docs: http://localhost:${PORT}/api-docs`);
    });
}

if (process.env.NODE_ENV !== 'test') {
    start();
}