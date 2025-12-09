// Test admin login exactly as frontend does
const testAdminLogin = async () => {
    const API_URL = 'http://localhost:8000';
    const loginEndpoint = '/admin/login';

    const body = {
        username: 'admin',
        password: 'adminpassword'
    };

    console.log('Testing admin login...');
    console.log('Endpoint:', API_URL + loginEndpoint);
    console.log('Body:', JSON.stringify(body));

    try {
        const response = await fetch(API_URL + loginEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        console.log('Status:', response.status);
        console.log('OK:', response.ok);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'An error occurred' }));
            console.error('Error response:', error);
            throw new Error(error.detail || 'API request failed');
        }

        const data = await response.json();
        console.log('Success! Token received:', data.access_token?.substring(0, 20) + '...');
        console.log('Username:', data.username);
        console.log('Role:', data.role);

        return data;
    } catch (error) {
        console.error('Login failed:', error.message);
        throw error;
    }
};

// Run test
testAdminLogin().then(() => {
    console.log('\n✅ Admin login test PASSED');
}).catch((error) => {
    console.error('\n❌ Admin login test FAILED:', error.message);
});
