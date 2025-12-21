import express from 'express';
import { generateProductSuggestions } from '../controller/ai.controller.js';

const router = express.Router();

router.post('/suggest-product-content', generateProductSuggestions);

export default router;
