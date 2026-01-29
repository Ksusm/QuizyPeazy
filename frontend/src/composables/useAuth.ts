// src/composables/useAuth.ts - Complete auth with token refresh
import { reactive, ref } from 'vue';
import axios from 'axios';
import * as client from 'openid-client';
import { jwtDecode } from "jwt-decode";
import config from "@/config";
import type { User } from "@/types/User";

// Reactive auth state
const state = reactive({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    user: null as User | null,
    keycloakUser: null as any,
    authenticated: false,
});

const error = ref<string | null>(null);
let codeChallenge: string;
let authConfig: client.Configuration;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

export function useAuth() {

    // Check if access token is expired or will expire soon
    const isTokenExpired = (token: string, bufferSeconds = 60): boolean => {
        try {
            const decoded: any = jwtDecode(token);
            const expirationTime = decoded.exp * 1000; // Convert to milliseconds
            const currentTime = Date.now();
            const bufferTime = bufferSeconds * 1000;

            return currentTime >= (expirationTime - bufferTime);
        } catch (err) {
            console.error('Failed to decode token:', err);
            return true; // Treat as expired if we can't decode
        }
    };

    // Refresh access token using refresh token
    const refreshAccessToken = async (): Promise<boolean> => {
        if (!state.refreshToken) {
            console.warn('[AUTH] No refresh token available');
            return false;
        }

        try {
            console.log('[AUTH] Refreshing access token...');

            // Use OpenID client to refresh token
            const tokens = await client.refreshTokenGrant(authConfig, state.refreshToken);

            if (!tokens.access_token) {
                throw new Error('No access token in refresh response');
            }

            // Update tokens
            state.accessToken = tokens.access_token;
            state.keycloakUser = jwtDecode(tokens.access_token);

            // Update refresh token if new one provided
            if (tokens.refresh_token) {
                state.refreshToken = tokens.refresh_token;
                localStorage.setItem('refresh_token', tokens.refresh_token);
            }

            // Save new access token
            localStorage.setItem('access_token', tokens.access_token);

            console.log('[AUTH] Token refreshed successfully');

            // Schedule next refresh
            scheduleTokenRefresh();

            return true;
        } catch (err) {
            console.error('[AUTH] Failed to refresh token:', err);
            // If refresh fails, logout
            logout();
            return false;
        }
    };

    // Schedule automatic token refresh
    const scheduleTokenRefresh = () => {
        // Clear existing timer
        if (refreshTimer) {
            clearTimeout(refreshTimer);
        }

        if (!state.accessToken) return;

        try {
            const decoded: any = jwtDecode(state.accessToken);
            const expirationTime = decoded.exp * 1000;
            const currentTime = Date.now();

            // Refresh 2 minutes before expiration
            const refreshTime = expirationTime - currentTime - (2 * 60 * 1000);

            if (refreshTime > 0) {
                console.log(`[AUTH] Token refresh scheduled in ${Math.round(refreshTime / 1000)} seconds`);
                refreshTimer = setTimeout(async () => {
                    await refreshAccessToken();
                }, refreshTime);
            } else {
                // Token already expired or expires very soon
                console.log('[AUTH] Token expired, refreshing immediately');
                refreshAccessToken();
            }
        } catch (err) {
            console.error('Failed to schedule token refresh:', err);
        }
    };

    // Restore session from localStorage
    const restoreSession = async () => {
        const token = localStorage.getItem('access_token');
        const refreshToken = localStorage.getItem('refresh_token');
        const userData = localStorage.getItem('user');

        if (!token) {
            console.log('[AUTH] No session to restore');
            return false;
        }

        console.log('[AUTH] Restoring session from localStorage');

        // Check if token is expired
        if (isTokenExpired(token)) {
            console.log('[AUTH] Access token expired');

            // Try to refresh
            if (refreshToken) {
                state.refreshToken = refreshToken;
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Tokens refreshed, continue with restored session
                    if (userData) {
                        state.user = JSON.parse(userData);
                    }
                    state.authenticated = true;
                    return true;
                }
            }

            // Cannot restore session
            console.log('[AUTH] Cannot restore session, tokens expired');
            logout();
            return false;
        }

        // Token is valid
        state.authenticated = true;
        state.accessToken = token;
        state.refreshToken = refreshToken;

        if (userData) {
            state.user = JSON.parse(userData);
        }

        try {
            state.keycloakUser = jwtDecode(token);
        } catch (err) {
            console.error('Failed to decode token:', err);
        }

        // Schedule token refresh
        scheduleTokenRefresh();

        console.log('[AUTH] Session restored successfully');
        return true;
    };

    // Initialize OpenID client
    const init = async () => {
        const issuerUri = `${config.keycloak.baseUrl}/realms/${config.keycloak.realm}`;

        authConfig = await client.discovery(
            new URL(issuerUri),
            config.keycloak.clientId!,
            undefined,
            undefined,
            { execute: [client.allowInsecureRequests] }
        );

        // Restore session after config is loaded
        await restoreSession();
    }

    // Start login
    const login = async () => {
        localStorage.setItem('code_verifier', client.randomPKCECodeVerifier())
        codeChallenge = await client.calculatePKCECodeChallenge(localStorage.getItem('code_verifier')!)

        let parameters: Record<string, string> = {
            redirect_uri: config.keycloak.redirectUri,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        }

        localStorage.setItem('state', client.randomState())
        parameters.state = localStorage.getItem('state')!

        let redirectTo: URL = client.buildAuthorizationUrl(authConfig, parameters)
        window.location.href = redirectTo.href;
    };

    // Handle OAuth callback
    const handleCallback = async (callbackUrl: string) => {
        try {
            let tokens: client.TokenEndpointResponse = await client.authorizationCodeGrant(
                authConfig,
                new URL(callbackUrl),
                {
                    pkceCodeVerifier: localStorage.getItem('code_verifier')!,
                    expectedState: localStorage.getItem('state')!,
                },
            )

            state.authenticated = true;
            state.accessToken = tokens.access_token!;
            state.refreshToken = tokens.refresh_token || null;
            state.keycloakUser = jwtDecode(tokens.access_token!);

            //  Save both tokens to localStorage
            localStorage.setItem('access_token', tokens.access_token!);
            if (tokens.refresh_token) {
                localStorage.setItem('refresh_token', tokens.refresh_token);
            }

            // Fetch user profile
            await fetchUserProfile();

            //  Schedule token refresh
            scheduleTokenRefresh();
        } catch (err) {
            console.error('Callback error:', err);
            error.value = 'Failed to complete login';
            throw err;
        }
    };

    // Fetch user profile
    const fetchUserProfile = async () => {
        if (!state.accessToken || !state.keycloakUser) return;

        try {
            const response = await axios.get(
                `${config.authServiceUrl}/auth/profile/${state.keycloakUser.sub}`,
                {
                    headers: {
                        Authorization: `Bearer ${state.accessToken}`
                    }
                }
            );
            state.user = response.data;

            // Save user to localStorage
            localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
        }
    };

    // Make authenticated request with automatic token refresh
    const authorizedRequest = async (endpoint: string, options = {}) => {
        if (!state.accessToken) {
            error.value = 'Not authenticated';
            throw new Error(error.value);
        }

        // Check if token is expired
        if (isTokenExpired(state.accessToken)) {
            console.log('⚠️ [AUTH] Token expired, refreshing before request');
            const refreshed = await refreshAccessToken();
            if (!refreshed) {
                throw new Error('Failed to refresh token');
            }
        }

        const response = await axios({
            url: endpoint,
            headers: {
                Authorization: `Bearer ${state.accessToken}`,
            },
            ...options,
        });
        return response.data;
    };

    // Logout
    const logout = () => {
        console.log('👋 [AUTH] Logging out');

        // Clear timer
        if (refreshTimer) {
            clearTimeout(refreshTimer);
            refreshTimer = null;
        }

        // Clear state
        state.authenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.user = null;
        state.keycloakUser = null;

        //  Clear localStorage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        localStorage.removeItem('code_verifier');
        localStorage.removeItem('state');
    };

    // Get username
    const getUsername = () => {
        return state.keycloakUser?.['preferred_username'] || state.user?.username;
    };

    // Get roles
    const getUserRoles = () => {
        return state.keycloakUser?.['resource_access']?.[config.keycloak.clientId]?.roles ?? []
    }

    // Check role
    const hasRole = (role: string) => {
        return getUserRoles().includes(role);
    }

    return {
        state,
        error,
        init,
        login,
        logout,
        handleCallback,
        authorizedRequest,
        getUsername,
        getUserRoles,
        hasRole,
        restoreSession,
        refreshAccessToken,
        isTokenExpired,
    };
}