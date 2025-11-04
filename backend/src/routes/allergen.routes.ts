import { Router } from 'express';
import {
  getAllAllergens,
  getAllergenById,
} from '../controllers/allergen.controller';

const router = Router();

router.get('/', getAllAllergens);
router.get('/:id', getAllergenById);

export default router;
