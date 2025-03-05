// Utility functions for database operations
import prisma from './prisma';
import type { Task, Location } from '.prisma/client';

// Task Types
export type TaskWithLocations = Task & {
  locations: Location[];
};

// Get all tasks for a user
export async function getUserTasks(userId: string): Promise<TaskWithLocations[]> {
  return prisma.task.findMany({
    where: { userId },
    include: { locations: true },
    orderBy: { createdAt: 'desc' },
  });
}

// Get incomplete tasks for a user
export async function getIncompleteTasks(userId: string): Promise<TaskWithLocations[]> {
  return prisma.task.findMany({
    where: { 
      userId,
      isCompleted: false
    },
    include: { locations: true },
    orderBy: { dueDate: 'asc' },
  });
}

// Get a single task by ID
export async function getTaskById(id: string, userId: string): Promise<TaskWithLocations | null> {
  return prisma.task.findFirst({
    where: { 
      id,
      userId 
    },
    include: { locations: true },
  });
}

// Create a new task
export async function createTask(
  data: {
    title: string;
    description?: string;
    dueDate?: Date;
    priority?: string;
    userId: string;
    locations?: {
      name: string;
      latitude: number;
      longitude: number;
      radius?: number;
      notifyOnArrival?: boolean;
      notifyOnDeparture?: boolean;
      reminderMessage?: string;
    }[];
  }
): Promise<TaskWithLocations> {
  const { locations, ...taskData } = data;
  
  return prisma.task.create({
    data: {
      ...taskData,
      locations: locations ? {
        create: locations
      } : undefined
    },
    include: { locations: true },
  });
}

// Update a task
export async function updateTask(
  id: string,
  userId: string,
  data: {
    title?: string;
    description?: string | null;
    isCompleted?: boolean;
    dueDate?: Date | null;
    priority?: string;
  }
): Promise<TaskWithLocations | null> {
  return prisma.task.update({
    where: { id, userId },
    data,
    include: { locations: true },
  });
}

// Delete a task
export async function deleteTask(id: string, userId: string): Promise<void> {
  await prisma.task.delete({
    where: { id, userId },
  });
}

// Add a location to a task
export async function addLocationToTask(
  taskId: string,
  userId: string,
  locationData: {
    name: string;
    latitude: number;
    longitude: number;
    radius?: number;
    notifyOnArrival?: boolean;
    notifyOnDeparture?: boolean;
    reminderMessage?: string;
  }
): Promise<TaskWithLocations | null> {
  // First, verify the task belongs to the user
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) return null;

  return prisma.task.update({
    where: { id: taskId },
    data: {
      locations: {
        create: locationData,
      },
    },
    include: { locations: true },
  });
}

// Remove a location from a task
export async function removeLocationFromTask(
  locationId: string,
  taskId: string,
  userId: string
): Promise<TaskWithLocations | null> {
  // First, verify the task belongs to the user
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });

  if (!task) return null;

  await prisma.location.delete({
    where: { id: locationId },
  });

  return prisma.task.findUnique({
    where: { id: taskId },
    include: { locations: true },
  });
} 