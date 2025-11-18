import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    // Ensure DB session uses Asia/Jakarta timezone so now()/timestamps align with local expectations
    try {
      await this.$executeRawUnsafe(`SET TIME ZONE 'Asia/Jakarta';`);
    } catch (err) {
      console.error('❌ Failed to set DB timezone:', err);
    }
    console.log('✅ Connected to PostgreSQL via Prisma');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
