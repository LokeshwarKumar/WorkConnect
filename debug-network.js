// Debug script to test network connectivity and API endpoints
// Run this in browser console when the app is running

async function debugNetworkIssues() {
    console.log('=== Network Debugging ===');
    
    // Test 1: Basic connectivity to backend
    try {
        console.log('1. Testing basic connectivity...');
        const response = await fetch('http://localhost:8080/api/auth/signin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'test', password: 'test' })
        });
        console.log('Basic connectivity status:', response.status);
    } catch (error) {
        console.error('Basic connectivity failed:', error.message);
        return;
    }
    
    // Test 2: Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    console.log('2. Authentication status:');
    console.log('Token exists:', !!token);
    console.log('User exists:', !!user);
    
    if (!token) {
        console.log('❌ No authentication token found');
        return;
    }
    
    // Test 3: Test profile endpoint with authentication
    try {
        console.log('3. Testing profile endpoint...');
        const profileResponse = await fetch('http://localhost:8080/api/users/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Profile endpoint status:', profileResponse.status);
        
        if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            console.log('Profile data:', profileData);
        } else {
            const errorText = await profileResponse.text();
            console.log('Profile endpoint error:', errorText);
        }
    } catch (error) {
        console.error('Profile endpoint failed:', error.message);
    }
    
    // Test 4: Test profile update
    try {
        console.log('4. Testing profile update...');
        const updateResponse = await fetch('http://localhost:8080/api/users/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                name: 'Debug Test',
                contactDetails: 'debug@test.com',
                address: 'Debug Address'
            })
        });
        
        console.log('Profile update status:', updateResponse.status);
        
        if (updateResponse.ok) {
            console.log('✅ Profile update successful');
        } else {
            const errorText = await updateResponse.text();
            console.log('❌ Profile update failed:', errorText);
        }
    } catch (error) {
        console.error('Profile update failed:', error.message);
    }
}

// Run the debug function
debugNetworkIssues();
