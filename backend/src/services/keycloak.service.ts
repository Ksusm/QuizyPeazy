import axios from 'axios';
import { Config } from '../../config';
import { ApiError } from '../types/api.error';

class KeycloakService {
    private adminToken: string | null = null;
    private tokenExpiresAt: number = 0;

    //Get admin access token from Keycloak
    private async getAdminToken(): Promise<string> {
        // Check if token is still valid
        if (this.adminToken && Date.now() < this.tokenExpiresAt) {
            return this.adminToken;
        }

        try {
            const response = await axios.post(
                `${Config.keycloak.baseUrl}/realms/master/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    client_id: 'admin-cli',
                    username: Config.keycloak.adminUsername,
                    password: Config.keycloak.adminPassword,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            this.adminToken = response.data.access_token;
            this.tokenExpiresAt = Date.now() + (response.data.expires_in - 10) * 1000; // Refresh 10s before expiry

            return this.adminToken;
        } catch (error: any) {
            console.error('Failed to get admin token:', error.response?.data || error.message);
            throw new ApiError('keycloak error', 'Failed to authenticate with Keycloak admin', 500);
        }
    }

    // Create a new user in Keycloak
    async createUser(username: string, password: string, email?: string) {
        const token = await this.getAdminToken();

        try {
            const response = await axios.post(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/users`,
                {
                    username,
                    email: email || `${username}@quizy-peazy.com`,
                    firstName: username,
                    lastName: 'User',
                    enabled: true,
                    emailVerified: true,
                    credentials: [
                        {
                            type: 'password',
                            value: password,
                            temporary: false,
                        },
                    ],
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Extract user ID from Location header
            const locationHeader = response.headers.location;
            const userId = locationHeader?.split('/').pop();

            return { userId, username };
        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new ApiError('conflict', 'Username already exists in Keycloak', 409);
            }
            console.error('Failed to create user:', error.response?.data || error.message);
            throw new ApiError('keycloak error', 'Failed to create user in Keycloak', 500);
        }
    }

    // Login user and get access token
    async loginUser(username: string, password: string) {
        try {
            const response = await axios.post(
                `${Config.keycloak.baseUrl}/realms/${Config.keycloak.realm}/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    client_id: Config.keycloak.clientId,
                    client_secret: Config.keycloak.clientSecret || '',
                    username,
                    password,
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            return {
                accessToken: response.data.access_token,
                refreshToken: response.data.refresh_token,
                expiresIn: response.data.expires_in,
            };
        } catch (error: any) {
            if (error.response?.status === 401) {
                throw new ApiError('unauthorized', 'Invalid username or password', 401);
            }
            console.error('Failed to login:', error.response?.data || error.message);
            throw new ApiError('keycloak error', 'Failed to login to Keycloak', 500);
        }
    }

    // Get user info from Keycloak by user ID
    async getUserById(userId: string) {
        const token = await this.getAdminToken();

        try {
            const response = await axios.get(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            return response.data;
        } catch (error: any) {
            console.error('Failed to get user:', error.response?.data || error.message);
            return null;
        }
    }
}

export default new KeycloakService();