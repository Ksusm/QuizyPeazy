import request from "../request";
import mongo from "../../src/database/mongo";
import { ObjectId } from "mongodb";
import axios from "axios";
import { Config } from "../../config";

export class AuthTestHelper {
    private static adminToken: string | null = null;
    private static adminUserId: string | null = null;
    private static adminKeycloakId: string | null = null;
    private static adminUsername: string | null = null;

   // Creates test Admin user with ADMIN role

    static async setupAdminUser(): Promise<void> {
        const username = `test-admin-${Date.now()}`;
        const password = 'test-password-123';

        try {
            // 1. Create user in Keycloak FIRST (not through backend)
            this.adminKeycloakId = await this.createKeycloakUser(username, password);

            // 2. Assign ADMIN role
            await this.assignAdminRole(this.adminKeycloakId);

            // 3. Create user in MongoDB manually (simulating registration)
            const userDoc = {
                username,
                keycloakId: this.adminKeycloakId,
                totalScore: 0,
                gamesPlayed: 0,
                createdAt: new Date()
            };

            const result = await mongo.db.collection("users").insertOne(userDoc);
            this.adminUserId = result.insertedId.toString();
            this.adminUsername = username;

            // 4. Login and get JWT token
            const loginRes = await request
                .post('/auth/login')
                .send({ username, password });

            if (loginRes.status !== 200) {
                throw new Error(`Login failed with status ${loginRes.status}: ${JSON.stringify(loginRes.body)}`);
            }

            this.adminToken = loginRes.body.accessToken;
            console.log('✅ Test admin user ready with token');

        } catch (error: any) {
            console.error('Failed to setup admin user:', error.message);
            throw error;
        }
    }

    // Creates user directly in Keycloak (bypassing backend)
    private static async createKeycloakUser(username: string, password: string): Promise<string> {
        const adminToken = await this.getKeycloakAdminToken();

        try {
            // Create user with proper settings
            const createRes = await axios.post(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/users`,
                {
                    username,
                    email: `${username}@test.com`,
                    firstName: 'Test',
                    lastName: 'Admin',
                    enabled: true,
                    emailVerified: true,
                    credentials: [
                        {
                            type: 'password',
                            value: password,
                            temporary: false,
                        },
                    ],
                    requiredActions: [],
                },
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            // Extract user ID from Location header
            const locationHeader = createRes.headers.location;
            const userId = locationHeader?.split('/').pop();

            if (!userId) {
                throw new Error('Failed to extract user ID from Keycloak response');
            }

            console.log(`✅ Keycloak user created: ${userId}`);
            return userId;

        } catch (error: any) {
            if (error.response?.status === 409) {
                throw new Error('Username already exists in Keycloak');
            }
            console.error('Failed to create Keycloak user:', error.response?.data || error.message);
            throw error;
        }
    }

    // Gets Keycloak admin token

    private static async getKeycloakAdminToken(): Promise<string> {
        try {
            const tokenRes = await axios.post(
                `${Config.keycloak.baseUrl}/realms/master/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type: 'password',
                    client_id: 'admin-cli',
                    username: Config.keycloak.adminUsername,
                    password: Config.keycloak.adminPassword,
                }),
                { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
            );

            return tokenRes.data.access_token;

        } catch (error: any) {
            console.error('Failed to get Keycloak admin token:', error.response?.data || error.message);
            throw new Error('Failed to authenticate with Keycloak admin');
        }
    }

    // Assigns ADMIN role to user via Keycloak Admin API

    private static async assignAdminRole(keycloakUserId: string): Promise<void> {
        try {
            const adminToken = await this.getKeycloakAdminToken();

            // Get client UUID
            const clientsRes = await axios.get(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/clients?clientId=${Config.keycloak.clientId}`,
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );

            const clientUuid = clientsRes.data[0].id;

            // Get ADMIN role ID
            const rolesRes = await axios.get(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/clients/${clientUuid}/roles`,
                { headers: { Authorization: `Bearer ${adminToken}` } }
            );

            const adminRole = rolesRes.data.find((role: any) => role.name === 'ADMIN');

            if (!adminRole) {
                throw new Error('ADMIN role not found in client roles');
            }

            // Assign role to user
            await axios.post(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/users/${keycloakUserId}/role-mappings/clients/${clientUuid}`,
                [adminRole],
                { headers: { Authorization: `Bearer ${adminToken}`, 'Content-Type': 'application/json' } }
            );

            console.log('✅ ADMIN role assigned to test user');

        } catch (error: any) {
            console.error('Failed to assign ADMIN role:', error.response?.data || error.message);
            throw error;
        }
    }

    // Returns admin JWT token

    static getAdminToken(): string {
        if (!this.adminToken) {
            throw new Error('Admin user not set up. Call setupAdminUser() in beforeAll first.');
        }
        return this.adminToken;
    }

    // Returns admin user ID (MongoDB)

    static getAdminUserId(): string {
        if (!this.adminUserId) {
            throw new Error('Admin user not set up. Call setupAdminUser() in beforeAll first.');
        }
        return this.adminUserId;
    }

    // Deletes admin user from MongoDB

    static async cleanupAdminUser(): Promise<void> {
        try {
            // 1. Delete from MongoDB
            if (this.adminUserId) {
                await mongo.db.collection("users").deleteOne({
                    _id: new ObjectId(this.adminUserId)
                });
            }

            // 2. Delete from Keycloak
            if (this.adminKeycloakId) {
                await this.deleteKeycloakUser(this.adminKeycloakId);
            }

            console.log('✅ Test admin user cleaned up');

        } catch (error: any) {
            console.error('Failed to cleanup admin user:', error.message);
        } finally {
            // Reset state regardless of cleanup success
            this.adminToken = null;
            this.adminUserId = null;
            this.adminKeycloakId = null;
            this.adminUsername = null;
        }
    }

    // Deletes user from Keycloak

    private static async deleteKeycloakUser(keycloakUserId: string): Promise<void> {
        try {
            const adminToken = await this.getKeycloakAdminToken();

            await axios.delete(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/users/${keycloakUserId}`,
                {
                    headers: {
                        Authorization: `Bearer ${adminToken}`,
                    },
                }
            );

            console.log(`✅ Keycloak user deleted`);

        } catch (error: any) {
            console.error('Failed to delete Keycloak user:', error.response?.data || error.message);
        }
    }
}