import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: 'checking',
        redis: 'checking',
      },
    };

    // Check database connection if DATABASE_URL is configured
    if (process.env.DATABASE_URL) {
      try {
        // Dynamic import to avoid build errors if Prisma isn't available
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        await prisma.$queryRaw`SELECT 1`;
        await prisma.$disconnect();
        healthStatus.services.database = 'connected';
      } catch (dbError) {
        healthStatus.services.database = 'disconnected';
        console.error('Database health check failed:', dbError);
      }
    } else {
      healthStatus.services.database = 'not_configured';
    }

    // Check Redis connection if REDIS_URL is configured
    if (process.env.REDIS_URL) {
      try {
        // Simple Redis check - would need ioredis or similar for full check
        healthStatus.services.redis = 'configured';
      } catch (redisError) {
        healthStatus.services.redis = 'disconnected';
        console.error('Redis health check failed:', redisError);
      }
    } else {
      healthStatus.services.redis = 'not_configured';
    }

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
