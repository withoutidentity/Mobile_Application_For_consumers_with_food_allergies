import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const accessSecret = process.env.ACCESS_TOKEN_SECRET!
const refreshSecret = process.env.REFRESH_TOKEN_SECRET!

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name, // Provide a default or get from req.body
        updatedAt: new Date(), // Set to current date/time
      },
    });

    res.json({ message: 'User registered', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ id: user.id }, accessSecret, { expiresIn: '7d' })
    const refreshToken = jwt.sign({ id: user.id }, refreshSecret, { expiresIn: '14d' })

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    })

    res.json({ accessToken, refreshToken })
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Login failed' });
  }
};
