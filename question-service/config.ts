export const Config = {
    port: process.env.PORT || 3002,
    mongo: {
        url: process.env.MONGO_URL,
        dbName: process.env.MONGO_DB_NAME,
    },
    authService: {
        url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    },
};