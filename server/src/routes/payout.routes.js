import express from 'express';
import { protect, authorize } from '../../middleware/auth.js';
import { requestPayout, getPayouts, processPayout } from '../controller/payout.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', getPayouts);
router.post('/request', authorize('vendor'), requestPayout);
router.patch('/:id/process', authorize('admin'), processPayout);

export default router;
