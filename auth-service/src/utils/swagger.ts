import swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth Service API',
      version: '1.0.0',
      description: 'Authentication service for Quizy-Peazy',
    },
    servers: [
      {
        url: 'http://localhost:3001',
        description: 'Auth Service',
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
  apis: ['./src/controllers/**/*.ts', './src/types/**/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);