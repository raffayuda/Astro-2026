import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { eq } from 'drizzle-orm';
import { db } from './index';
import { users } from './schema';

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'astro@admin.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || 'password';
const ADMIN_NAME = 'Admin ASTRO';

async function seedAdmin() {
  console.log('Pushing administrator account to database...');
  const { auth } = await import('@/src/server/auth');

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.email, ADMIN_EMAIL));

  let adminId = existing?.id;

  if (!adminId) {
    try {
      const result = await auth.api.signUpEmail({
        body: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD, name: ADMIN_NAME },
      });
      adminId = result?.user?.id;
    } catch {
      try {
        const result2 = await auth.api.createUser({
          body: {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            name: ADMIN_NAME,
            role: 'admin',
          },
        });
        adminId = (result2 as any)?.user?.id || (result2 as any)?.id;
      } catch (err) {
        console.error('Error in creating user:', err);
      }
    }
  }

  if (!adminId) {
    console.error('❌ Gagal membuat akun admin. Periksa koneksi database.');
    process.exitCode = 1;
    return;
  }

  // Ensure role is admin and emailVerified is true
  await db
    .update(users)
    .set({
      role: 'admin',
      emailVerified: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, adminId));

  console.log('\n=========================================');
  console.log('✅ AKUN ADMINISTRATOR BERHASIL DI-PUSH KE DB:');
  console.log(`   Email         : ${ADMIN_EMAIL}`);
  console.log(`   Password      : ${ADMIN_PASSWORD}`);
  console.log(`   Role          : admin`);
  console.log(`   Status Verif  : Terverifikasi (emailVerified: true)`);
  console.log('=========================================\n');
}

seedAdmin()
  .catch((err) => {
    console.error('❌ Terjadi kesalahan saat seed admin:', err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
