import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/init - Initialize the application with demo user
export async function GET() {
  try {
    let user = await db.user.findFirst();

    if (!user) {
      // Create a demo user if none exists
      user = await db.user.create({
        data: {
          email: 'demo@meetlink.com',
          name: 'Alex Johnson',
          username: 'alexjohnson',
          timezone: 'America/New_York',
          locale: 'en',
          company: 'TechCorp Inc.',
          defaultSlotDuration: 30,
          defaultBufferBefore: 5,
          defaultBufferAfter: 10,
          role: 'USER',
          plan: 'PRO',
        },
      });

      return NextResponse.json({
        success: true,
        data: user,
        message: 'Demo user created',
      });
    }

    return NextResponse.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initialize' },
      { status: 500 }
    );
  }
}
