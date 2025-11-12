import { PrismaClient, Role, DeviceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Create Admin User ---
  const password = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password,
      role: Role.ADMIN,
    },
  });
  console.log(`✅ User created: ${admin.username}`);

  // --- Create Device (standalone) ---
  const device = await prisma.device.upsert({
    where: { serialNumber: 'A47221B7B3F8' },
    update: {},
    create: {
      serialNumber: 'A47221B7B3F8',
      name: 'Washer Unit 1',
      description: 'Laundry Machine - ESP32',
      location: 'Main Branch - Room A',
      status: DeviceStatus.OFFLINE,
    },
  });
  console.log(`✅ Device created: ${device.serialNumber}`);

  console.log('🌱 Seed finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
