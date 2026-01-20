import { Prisma } from 'db/generated/prisma/client';
import { prisma } from '../../config/db';

export const userService = {
  // Get all users
  getAll: async () => {
    return await prisma.user.findMany({
      select: {
        id: true, email: true, username: true, role: true, isActive: true, createdAt: true
      }
    });
  },

  // Get single user
  getById: async (id: string) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, username: true, role: true, isActive: true, createdAt: true
      }
    });
  },

  // Create user
  create: async (data: Prisma.UserCreateInput) => {
    return await prisma.user.create({
      data,
      select: {
        id: true, email: true, username: true, role: true, createdAt: true
      }
    });
  }
};