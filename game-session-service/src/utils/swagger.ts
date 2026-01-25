import swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Game Session Service API',
            version: '1.0.0',
            description: 'Game session management service for Quizy-Peazy',
        },
        servers: [
            {
                url: 'http://localhost:3003',
                description: 'Game Session Service',
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