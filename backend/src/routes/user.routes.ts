import { Router } from 'express';
import { getMyProfile, updateUserAllergies, addScanHistory, getScanHistory } from '../controllers/user.controller';
import { authenticateToken } from '../middlewares/auth.middleware';

const userRoutes = Router();

// ทุก Route ในไฟล์นี้ต้องผ่านการตรวจสอบสิทธิ์ก่อน
userRoutes.use(authenticateToken);

userRoutes.get('/me', getMyProfile);
userRoutes.put('/me/allergies', updateUserAllergies);
userRoutes.post('/me/history', addScanHistory); // เพิ่ม route สำหรับบันทึกประวัติการสแกน
userRoutes.get('/me/scanHistory', getScanHistory);
export default userRoutes;