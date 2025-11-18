const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('\n🧪 Testing TaskWeave Backend API...\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣  Testing Health Endpoint...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('   ✓ Health:', health.data);

    // Test 2: Register User
    console.log('\n2️⃣  Testing User Registration...');
    try {
      const registerResponse = await axios.post(`${BASE_URL}/api/auth/register`, {
        email: 'newuser@taskweave.com',
        password: 'SecurePass123!',
        name: 'New User'
      });
      console.log('   ✓ Registration successful!');
      console.log('   User:', registerResponse.data.user);
      console.log('   Token:', registerResponse.data.token.substring(0, 30) + '...');
      
      const token = registerResponse.data.token;

      // Test 3: Create Task
      console.log('\n3️⃣  Testing Task Creation...');
      const taskResponse = await axios.post(`${BASE_URL}/api/tasks`, {
        title: 'Test Task from API',
        description: 'This is a test task',
        platform: 'chatgpt',
        tags: ['test', 'api']
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✓ Task created!');
      console.log('   Task ID:', taskResponse.data.id);
      console.log('   Title:', taskResponse.data.title);

      // Test 4: Get Tasks
      console.log('\n4️⃣  Testing Get Tasks...');
      const tasksResponse = await axios.get(`${BASE_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('   ✓ Retrieved tasks!');
      console.log('   Total:', tasksResponse.data.tasks.length);

      console.log('\n' + '='.repeat(70));
      console.log('✅ ALL API TESTS PASSED!');
      console.log('='.repeat(70) + '\n');

    } catch (registerError) {
      if (registerError.response?.status === 400 && registerError.response?.data?.error === 'User already exists') {
        console.log('   ℹ️  User exists, testing login instead...');
        
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
          email: 'newuser@taskweave.com',
          password: 'SecurePass123!'
        });
        console.log('   ✓ Login successful!');
        console.log('   Token:', loginResponse.data.token.substring(0, 30) + '...');
      } else {
        throw registerError;
      }
    }

  } catch (error) {
    console.error('\n❌ API Test Failed:');
    console.error('   Message:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testAPI();

