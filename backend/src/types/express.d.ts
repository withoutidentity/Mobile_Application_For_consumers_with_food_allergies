import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User; // Use User type from Prisma
    }
  }
}
