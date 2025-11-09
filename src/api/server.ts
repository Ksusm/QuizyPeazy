import statusController from "./controllers/status.controller";
import questionController from "./controllers/question.controller";

const express = require("express");
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "../utils/swagger";

export const server = express();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

server.get("/status", statusController.getStatus);
server.post("/questions", questionController.create);
server.get("/questions", questionController.findAll);
server.get("/questions/:id", questionController.findById);
server.put("/questions/:id", questionController.update);
server.delete("/questions/:id", questionController.delete);
