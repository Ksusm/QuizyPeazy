import axios from "axios";
import { Config } from "../../config";

export class AuthTestHelper {
    private static adminToken: string | null = null;
    private static testUsername: string | null = null;
    private static testUserId: string | null = null;


    static async setupAdminUser(): Promise<void> {
        const username = `test-admin-${Date.now()}`;
        const password = 'test-password-123';

        try {
            const registerRes = await axios.post(
                `${Config.authService.url}/auth/register`,
                {
                    username,
                    password,
                    roles: ['ADMIN']
                },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (registerRes.status !== 201) {
                throw new Error(`Registration failed: ${JSON.stringify(registerRes.data)}`);
            }

            this.testUsername = username;
            this.testUserId = registerRes.data._id;

            console.log(`Test ADMIN user created: ${username}`);

            const loginRes = await axios.post(
                `${Config.authService.url}/auth/login`,
                { username, password },
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (loginRes.status !== 200) {
                throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
            }

            this.adminToken = loginRes.data.accessToken;
            console.log('Test ADMIN user ready with token');

        } catch (error: any) {
            console.error('Failed to setup test user:', error.response?.data || error.message);
            throw error;
        }
    }

    static getAdminToken(): string {
        if (!this.adminToken) {
            throw new Error('Admin user not set up. Call setupAdminUser() in beforeAll first.');
        }
        return this.adminToken;
    }

    static async cleanupAdminUser(): Promise<void> {
        if (!this.testUsername) {
            console.log('No test user to clean up');
            return;
        }

        try {
            await axios.delete(
                `${Config.authService.url}/auth/users/${this.testUserId}`,
                { headers: { 'Authorization': `Bearer ${this.adminToken}` } }
            );

        } catch (error: any) {
            console.error('Failed to cleanup test user:', error.response?.data || error.message);
        } finally {
            this.adminToken = null;
            this.testUsername = null;
            this.testUserId = null;
            console.log('Test user state cleaned up');
        }
    }
}