import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Starting database initialization...');
  
  try {
    // Create tables from the Prisma schema
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    
    console.log('✅ Database schema created');
    
    // Create a demo user
    const hashedPassword = await bcrypt.hash('password', 10);
    
    const demoUser = await prisma.user.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword,
      },
    });
    
    console.log(`✅ Demo user created: ${demoUser.email}`);
    
    // Create some demo tasks
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Task 1 - Basic task for today
    const task1 = await prisma.task.create({
      data: {
        title: 'Complete project setup',
        description: 'Set up the development environment and install dependencies',
        dueDate: now,
        priority: 'high',
        userId: demoUser.id,
      }
    });
    
    console.log(`✅ Demo task created: ${task1.title}`);
    
    // Task 2 - Task with location for tomorrow
    const task2 = await prisma.task.create({
      data: {
        title: 'Grocery shopping',
        description: 'Buy fruits, vegetables, and milk',
        dueDate: tomorrow,
        priority: 'medium',
        userId: demoUser.id,
        locations: {
          create: {
            name: 'Supermarket',
            latitude: 40.7128,
            longitude: -74.0060,
            radius: 100,
            notifyOnArrival: true,
            reminderMessage: 'Don\'t forget to buy milk!',
          }
        }
      }
    });
    
    console.log(`✅ Demo task with location created: ${task2.title}`);
    
    // Task 3 - Task for next week
    const task3 = await prisma.task.create({
      data: {
        title: 'Team meeting',
        description: 'Weekly planning and progress review',
        dueDate: nextWeek,
        priority: 'low',
        userId: demoUser.id,
      }
    });
    
    console.log(`✅ Demo task created: ${task3.title}`);
    
    console.log('✅ Database initialization completed successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 