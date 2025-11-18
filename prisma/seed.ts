import { PrismaClient, Role, DeviceStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Create Admin Users ---
  const adminUsers = [
    {
      username: 'admin',
      email: 'puremachine99@gmail.com',
      password: 'nopel123',
    },
    {
      username: 'admin2',
      email: 'mynameisnoz@gmail.com',
      password: 'nozforever',
    },
  ];

  for (const admin of adminUsers) {
    const hashed = await bcrypt.hash(admin.password, 10);
    const record = await prisma.user.upsert({
      where: { email: admin.email },
      update: {
        password: hashed,
        username: admin.username,
        role: Role.ADMIN,
      },
      create: {
        username: admin.username,
        email: admin.email,
        password: hashed,
        role: Role.ADMIN,
      },
    });
    console.log(`✅ Admin created: ${record.email}`);
  }

  // --- Create Device (standalone) ---
  const device = await prisma.device.upsert({
    where: { serialNumber: '841FE826AE0C' },
    update: {},
    create: {
      serialNumber: '841FE826AE0C',
      name: 'PJU 1',
      description: 'Lampu Punk',
      location: 'P57F+J37, Cikarang, Simpangan, Kec. Cikarang Utara, Kabupaten Bekasi, Jawa Barat 17530',
      latitude: -6.2859910037091415,
      longitude: 107.17263759257047,
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
