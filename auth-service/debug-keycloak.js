const axios = require('axios');

const KEYCLOAK_BASE_URL = 'http://localhost:8091';
const KEYCLOAK_REALM = 'QUIZY-PEAZY-TEST'; // ← Zkus i 'quizy-peazy-test'
const CLIENT_ID = 'quizy-peazy-client';
const CLIENT_SECRET = 'G1nEm9FwNOWuXekEWthoBo9f5pOqQK6Q';
const USERNAME = 'test-admin-manual'; // ← Vytvoř tohoto uživatele v Keycloaku
const PASSWORD = 'test123';

async function debugToken() {
    console.log('🔍 Testing Keycloak configuration...');
    console.log('Realm:', KEYCLOAK_REALM);
    console.log('Client ID:', CLIENT_ID);
    console.log('Username:', USERNAME);

    try {
        // Login a získání tokenu
        const loginResponse = await axios.post(
            `${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`,
            new URLSearchParams({
                grant_type: 'password',
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                username: USERNAME,
                password: PASSWORD,
            }),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );

        const accessToken = loginResponse.data.access_token;
        console.log('\n✅ Login successful!');

        // Dekódování tokenu
        const base64Url = accessToken.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const decoded = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));

        console.log('\n📋 Full JWT Token Payload:');
        console.log(JSON.stringify(decoded, null, 2));

        console.log('\n🔍 Roles Analysis:');
        console.log('Realm roles:', decoded.realm_access?.roles ?? '❌ NOT FOUND');
        console.log(`Client roles [${CLIENT_ID}]:`,
            decoded.resource_access?.[CLIENT_ID]?.roles ?? '❌ NOT FOUND');

        // Nejdůležitější kontrola
        if (decoded.resource_access?.[CLIENT_ID]?.roles?.includes('ADMIN')) {
            console.log('\n✅ SUCCESS! ADMIN role is present in token!');
        } else {
            console.log('\n❌ PROBLEM! ADMIN role is MISSING in token!');
            console.log('Available client roles:', decoded.resource_access?.[CLIENT_ID]?.roles);
        }

    } catch (error) {
        console.error('\n❌ Error:', error.response?.data || error.message);
        console.error('\n💡 Possible issues:');
        console.error('1. Realm name is wrong - try "quizy-peasy-test" with lowercase');
        console.error('2. Client ID is wrong');
        console.error('3. Client secret is wrong');
        console.error('4. User "test-admin-manual" does not exist in Keycloak');
        console.error('5. User does not have ADMIN client role assigned');
        console.error('6. Keycloak is not running on http://localhost:8091');
    }
}

debugToken();