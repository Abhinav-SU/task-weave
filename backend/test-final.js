const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5444,  // FINAL PORT - avoiding local PostgreSQL conflicts!
  database: 'taskweave',
  user: 'postgres',
  password: 'password',
});

pool.query('SELECT current_database(), current_user, version()').then(res => {
  console.log('\n🎉🎉🎉 SUCCESS! Connected to PostgreSQL on port 5444! 🎉🎉🎉\n');
  console.log('  Database:', res.rows[0].current_database);
  console.log('  User:', res.rows[0].current_user);
  console.log('  Version:', res.rows[0].version.substring(0, 60) + '...');
  
  // Test table
  return pool.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position");
}).then(res => {
  console.log('\n✓ Users table columns:', res.rows.map(r => r.column_name).join(', '));
  
  // Test insert
  return pool.query(
    "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
    ['victory@taskweave.com', 'hashedpassword123', 'Victory User']
  );
}).then(res => {
  console.log('\n✓ Insert test successful!');
  console.log('  Created user:', res.rows[0]);
  
  // Cleanup
  return pool.query("DELETE FROM users WHERE email = 'victory@taskweave.com'");
}).then(() => {
  console.log('\n✓ Cleanup successful!');
  console.log('\n' + '='.repeat(70));
  console.log('🎊 ALL TESTS PASSED! Database is FULLY FUNCTIONAL! 🎊');
  console.log('='.repeat(70));
  console.log('\n✅ Next steps:');
  console.log('   1. Run: npm run dev');
  console.log('   2. Test API endpoints');
  console.log('   3. Continue with frontend/extension development\n');
  pool.end();
  process.exit(0);
}).catch(err => {
  console.error('\n✗ FAILED:', err.message);
  console.error('  Code:', err.code);
  pool.end();
  process.exit(1);
});

