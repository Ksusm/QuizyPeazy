import express = require("express");
import swaggerUi = require("swagger-ui-express");
import { swaggerSpec } from "../utils/swagger";
import questionController from "./controllers/question/question.controller";
import authController from "./controllers/auth/auth.controller";
import { apiErrorHandler } from "../middleware/error.middleware";
import { hasAnyRole, oAuthModel } from "../middleware/auth.middleware";

const ExpressOAuthServer = require('@node-oauth/express-oauth-server');

export const server = express();

// Authentication
const auth = new ExpressOAuthServer({ model: oAuthModel });

// Middleware to parse JSON and URL-encoded data
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// Swagger API Documentation
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
server.get('/health', (req, res) => res.sendStatus(200));

// PUBLIC ROUTES (no auth required)
server.post('/auth/register', authController.register);
server.post('/auth/login', authController.login);
server.get('/questions', questionController.findAll);
server.get('/questions/:id', questionController.findById);

// PROTECTED ROUTES (auth required)
// admin
server.post('/questions', [auth.authenticate(), hasAnyRole('ADMIN')], questionController.create);
server.put('/questions/:id', [auth.authenticate(), hasAnyRole('ADMIN')], questionController.update);
server.delete('/questions/:id', [auth.authenticate(), hasAnyRole('ADMIN')], questionController.delete);

// authenticated user
server.get('/auth/profile/:id', [auth.authenticate()], authController.getProfile);
server.put('/auth/profile/:id', [auth.authenticate()], authController.updateProfile);

// ERROR HANDLING MIDDLEWARE
server.use(apiErrorHandler);