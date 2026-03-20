import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // Create default event types
  const eventTypes = [
    {
      name: '30 Minute Meeting',
      slug: '30min',
      description: 'Quick sync or consultation',
      duration: 30,
      color: '#10B981',
      isPublic: true,
      isActive: true,
      requiresConfirmation: false,
    },
    {
      name: '60 Minute Meeting',
      slug: '60min',
      description: 'Detailed discussion or demo',
      duration: 60,
      color: '#3B82F6',
      isPublic: true,
      isActive: true,
      requiresConfirmation: false,
    },
    {
      name: '15 Minute Chat',
      slug: '15min',
      description: 'Quick question or introduction',
      duration: 15,
      color: '#8B5CF6',
      isPublic: true,
      isActive: true,
      requiresConfirmation: false,
    },
  ];

  console.log('Creating default event types...');
  for (const eventType of eventTypes) {
    await prisma.eventType.upsert({
      where: { slug: eventType.slug },
      update: eventType,
      create: eventType,
    });
  }

  // Create default availability schedule
  console.log('Creating default availability...');
  const defaultAvailability = [
    { day: 'MONDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'TUESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'WEDNESDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'THURSDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'FRIDAY', startTime: '09:00', endTime: '17:00', isAvailable: true },
    { day: 'SATURDAY', startTime: '09:00', endTime: '17:00', isAvailable: false },
    { day: 'SUNDAY', startTime: '09:00', endTime: '17:00', isAvailable: false },
  ];

  // Create system configuration
  console.log('Creating system configuration...');
  const systemConfigs = [
    { key: 'app.version', value: '1.0.0', description: 'Application version' },
    { key: 'app.seed_completed', value: 'true', description: 'Seed completed flag' },
    { key: 'booking.default_buffer_before', value: '5', description: 'Default buffer before meetings' },
    { key: 'booking.default_buffer_after', value: '5', description: 'Default buffer after meetings' },
  ];

  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: config,
      create: config,
    });
  }

  console.log('Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
