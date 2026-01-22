import axios from "axios";
import { Config } from "../../config";
import request from "../request";
import mongo from "../../src/database/mongo";

export class AuthTestHelper {
    private static adminToken: string | null = null;
    private static testUsername: string | null = null;

    static async setupAdminUser(): Promise<void> {
        const username = `test-admin-${Date.now()}`;
        const password = 'test-password-123';

        try {
            await request
                .post('/auth/register')
                .send({ username, password, roles: ['ADMIN'] });

            this.testUsername = username;

            const loginRes = await request
                .post('/auth/login')
                .send({ username, password });

            this.adminToken = loginRes.body.accessToken;
            console.log(`Test ADMIN ready: ${username}`);

        } catch (error: any) {
            console.error('Failed to setup admin user:', error.message);
            throw error;
        }
    }

    static async deleteUserByUsername(username: string): Promise<void> {
        if (!username) return;

        try {
            if (mongo.db) {
                await mongo.db.collection("users").deleteOne({ username });
            }

            const keycloakAdminToken = await this.getKeycloakAdminToken();

            const searchRes = await axios.get(
                `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/users?username=${username}&exact=true`,
                { headers: { Authorization: `Bearer ${keycloakAdminToken}` } }
            );

            if (searchRes.data && searchRes.data.length > 0) {
                const keycloakId = searchRes.data[0].id;
                await axios.delete(
                    `${Config.keycloak.baseUrl}/admin/realms/${Config.keycloak.realm}/users/${keycloakId}`,
                    { headers: { Authorization: `Bearer ${keycloakAdminToken}` } }
                );
                console.log(`Keycloak user deleted: ${username}`);
            }
        } catch (error: any) {
            console.error(`Cleanup failed for user ${username}:`, error.message);
        }
    }

    static getAdminToken(): string {
        if (!this.adminToken) throw new Error("Admin token not initialized");
        return this.adminToken;
    }

    static async cleanupAdminUser(): Promise<void> {
        if (this.testUsername) {
            await this.deleteUserByUsername(this.testUsername);
            this.testUsername = null;
            this.adminToken = null;
        }
    }

    private static async getKeycloakAdminToken(): Promise<string> {
        const res = await axios.post(
            `${Config.keycloak.baseUrl}/realms/master/protocol/openid-connect/token`,
            new URLSearchParams({
                grant_type: 'password',
                client_id: 'admin-cli',
                username: Config.keycloak.adminUsername,
                password: Config.keycloak.adminPassword,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return res.data.access_token;
    }
}