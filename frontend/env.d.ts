/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_AUTH_SERVICE_URL: string;
    readonly VITE_QUESTION_SERVICE_URL: string;
    readonly VITE_GAME_SERVICE_URL: string;
    readonly VITE_REALTIME_SERVICE_URL: string;
    readonly VITE_KEYCLOAK_BASE_URL: string;
    readonly VITE_KEYCLOAK_REALM: string;
    readonly VITE_KEYCLOAK_CLIENT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
