import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '~/generated/prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

const connectionString = `${process.env.DATABASE_URL}`;
const accelerateUrl = process.env.ACCELERATE_URL;

function createClient() {
  if (accelerateUrl) {
    // Production: route through Accelerate proxy for caching + connection pooling
    return new PrismaClient({ accelerateUrl } as any).$extends(withAccelerate());
  }
  // Local dev: direct PostgreSQL connection
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

const prisma = createClient() as unknown as PrismaClient;

export { prisma };
