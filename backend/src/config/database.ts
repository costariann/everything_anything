import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaGlobal ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  global.prismaGlobal = prisma;
}

export { BannerPosition, Prisma } from '@prisma/client';

export interface DatabaseStatus {
  connected: boolean;
  message: string;
  timestamp: string;
}

export async function checkDatabaseConnection(): Promise<DatabaseStatus> {
  const timestamp = new Date().toISOString();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      connected: true,
      message: 'PostgreSQL & Prisma connection successful',
      timestamp,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return {
      connected: false,
      message,
      timestamp,
    };
  }
}
