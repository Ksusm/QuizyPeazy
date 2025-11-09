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
server.post("/cats", questionController.create);
server.get("/cats", questionController.findAll);
server.get("/cats/:id", questionController.findById);
server.put("/cats/:id", questionController.update);
server.delete("/cats/:id", questionController.delete);
