import swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quizy-Peazy API Documentation',
      version: '1.0.0',
      description: 'Multiplayer trivia game API with Keycloak authentication',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['src/api/controllers/**/*.ts', 'src/types/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);