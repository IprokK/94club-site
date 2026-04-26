import 'dotenv/config';
import { prisma } from '../src/lib/prisma.js';
import { ensureAdminUser } from '../src/bootstrap/ensureAdmin.js';

async function run() {
  await prisma.$connect();
  await ensureAdminUser({
    login: process.env.ADMIN_LOGIN || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin12345',
    role: process.env.ADMIN_ROLE || 'admin'
  });
}

run()
  .then(async () => {
    await prisma.$disconnect();
    // eslint-disable-next-line no-console
    console.log('Seed done');
  })
  .catch(async (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

