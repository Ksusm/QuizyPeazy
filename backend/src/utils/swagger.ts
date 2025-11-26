import swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Quizy-Peazy API Documentation',
      version: '1.0.0',
    },
  },
  apis: ['src/api/controllers/*.ts', 'src/types/*.ts'],
};

export const swaggerSpec = swaggerJSDoc(options);
