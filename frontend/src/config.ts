export default {
    // Backend microservices URLs
    authServiceUrl: import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:3001',
    questionServiceUrl: import.meta.env.VITE_QUESTION_SERVICE_URL || 'http://localhost:3002',
    gameServiceUrl: import.meta.env.VITE_GAME_SERVICE_URL || 'http://localhost:3003',
    realtimeServiceUrl: import.meta.env.VITE_REALTIME_SERVICE_URL || 'http://localhost:3004',

    // Keycloak OAuth2/OIDC configuration
    keycloak: {
        baseUrl: import.meta.env.VITE_KEYCLOAK_BASE_URL || 'http://localhost:8091',
        realm: import.meta.env.VITE_KEYCLOAK_REALM || 'QUIZY-PEAZY',
        clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'quizy-peazy-client',
        redirectUri: location.origin + '/login-callback', // Must match Keycloak "Valid Redirect URIs"
    }
}