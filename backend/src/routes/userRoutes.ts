import { Router } from 'express';
import { getMyProfile, updateUserAllergies } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const userRoutes = Router();

// ทุก Route ในไฟล์นี้ต้องผ่านการตรวจสอบสิทธิ์ก่อน
userRoutes.use(authenticateToken);

userRoutes.get('/me', getMyProfile);
userRoutes.put('/me/allergies', updateUserAllergies);

export default userRoutes;