// Quick WebSocket connection test
const io = require('socket.io-client');

// First, get a JWT token by logging in
async function testWebSocket() {
  try {
    // 1. Login to get token
    console.log('📝 Step 1: Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      console.log('⚠️  Login failed. Make sure you have a test user registered.');
      console.log('   Run: curl -X POST http://localhost:3000/api/auth/register -H "Content-Type: application/json" -d "{\\"email\\":\\"test@example.com\\",\\"password\\":\\"password123\\",\\"name\\":\\"Test User\\"}"');
      return;
    }

    const { token } = await loginResponse.json();
    console.log('✅ Logged in successfully');
    console.log(`   Token: ${token.substring(0, 20)}...`);

    // 2. Connect to WebSocket
    console.log('\n🔌 Step 2: Connecting to WebSocket...');
    const socket = io('http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ WebSocket connected!');
      console.log(`   Socket ID: ${socket.id}`);

      // 3. Test connection initialization
      console.log('\n📡 Step 3: Initializing connection...');
      socket.emit('connection:init');
    });

    socket.on('connection:init', (data) => {
      console.log('✅ Connection initialized!');
      console.log(`   User ID: ${data.userId}`);
      console.log(`   Active Tasks: ${data.activeTasks?.length || 0}`);

      // 4. Test ping/pong
      console.log('\n🏓 Step 4: Testing ping/pong...');
      socket.emit('ping');
    });

    socket.on('pong', (data) => {
      console.log('✅ Pong received!');
      console.log(`   Timestamp: ${data.timestamp}`);

      console.log('\n✨ All WebSocket tests passed!\n');
      console.log('🎉 WebSocket server is working correctly!');
      console.log('\n📋 Next steps:');
      console.log('   1. Open backend/test-websocket.html in your browser');
      console.log('   2. Enter the JWT token (shown above)');
      console.log('   3. Click "Connect" and test the interactive features');
      
      // Clean up
      setTimeout(() => {
        socket.disconnect();
        process.exit(0);
      }, 1000);
    });

    socket.on('error', (error) => {
      console.error('❌ WebSocket error:', error);
      process.exit(1);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      process.exit(1);
    });

    socket.on('disconnect', (reason) => {
      console.log(`\n🔌 Disconnected: ${reason}`);
    });

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

console.log('🧪 TaskWeave WebSocket Test\n');
console.log('Testing WebSocket server at http://localhost:3000\n');

testWebSocket();

