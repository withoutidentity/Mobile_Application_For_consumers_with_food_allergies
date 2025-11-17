import { Router } from 'express';
import {
  getAllAllergens,
  getAllergenById,
  createAllergen,
  updateAllergen,
  deleteAllergen,
} from '../controllers/allergen.controller';

const router = Router();

router.get('/', getAllAllergens);
router.get('/:id', getAllergenById);
router.post('/', createAllergen);
router.put('/:id', updateAllergen);
router.delete('/:id', deleteAllergen);

export default router;
