import bcrypt from 'bcrypt';
import { db, pool } from './index';
import { users } from './schema-simple';
import { eq } from 'drizzle-orm';

async function seed(): Promise<void> {
  const demoEmail = 'demo@taskweave.com';
  const demoPassword = 'Demo1234!';

  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, demoEmail),
    });

    if (existingUser) {
      console.log(`Demo user already exists: ${demoEmail}`);
      return;
    }

    const passwordHash = await bcrypt.hash(demoPassword, 10);

    await db.insert(users).values({
      email: demoEmail,
      password: passwordHash,
      name: 'TaskWeave Demo',
    });

    console.log(`Created demo user: ${demoEmail}`);
  } finally {
    await pool.end();
  }
}

seed().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
