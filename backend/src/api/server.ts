import express = require("express");
import swaggerUi = require("swagger-ui-express");
import { swaggerSpec } from "../utils/swagger";
import questionController from "./controllers/question/question.controller";


export const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
server.get('/health', (req, res) => res.sendStatus(200));

// Question routes
server.post('/questions', questionController.create);
server.get('/questions', questionController.findAll);
server.get('/questions/:id', questionController.findById);
server.put('/questions/:id', questionController.update);
server.delete('/questions/:id', questionController.delete);

// Auth routes
