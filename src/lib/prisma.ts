import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma: PrismaClient }

const getPooledDbUrl = () => {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  
  try {
    const parsedUrl = new URL(url);
    if (!parsedUrl.searchParams.has('pgbouncer')) {
      parsedUrl.searchParams.set('pgbouncer', 'true');
    }
    if (!parsedUrl.searchParams.has('connection_limit')) {
      parsedUrl.searchParams.set('connection_limit', '3'); // Limit to 3 connections per serverless instance
    }
    return parsedUrl.toString();
  } catch (e) {
    return url;
  }
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: getPooledDbUrl(),
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
