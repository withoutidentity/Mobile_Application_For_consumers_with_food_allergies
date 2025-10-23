import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

const accessSecret = process.env.ACCESS_TOKEN_SECRET!

export function authenticateToken (req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    res.sendStatus(401)
    return
  }

  jwt.verify(token, accessSecret, (err, user) => {
    if (err) {
      res.sendStatus(403)
      return
    }
    // @ts-ignore
    req.user = user
    next()
  })
}
