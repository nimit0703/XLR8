import { Request, Response } from 'express';
import { userService } from './user.service';

export const userController = {
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await userService.getAll();
      res.json({ success: true, data: users, count: users.length });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  },

  getUserById: async (req: Request, res: Response) => {
    try {
      const user = await userService.getById(req.params.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Failed to fetch user' });
    }
  },

  createUser: async (req: Request, res: Response) => {
    try {
      const { email, username, password } = req.body;
      
      if (!email || !username || !password) {
        return res.status(400).json({ success: false, error: 'Missing fields' });
      }

      const newUser = await userService.create({ email, username, password });
      res.status(201).json({ success: true, message: 'User created', data: newUser });
    } catch (error: any) {
      if (error.code === 'P2002') { // Prisma unique constraint code
        return res.status(409).json({ success: false, error: 'User already exists' });
      }
      res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  }
};