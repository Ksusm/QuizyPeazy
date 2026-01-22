import swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Question Service API',
            version: '1.0.0',
            description: 'Question management service for Quizy-Peazy',
        },
        servers: [
            {
                url: 'http://localhost:3002',
                description: 'Question Service',
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