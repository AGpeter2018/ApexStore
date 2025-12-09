import express from "express";
import { getCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection, getCollectionById} from "../controller/product-collection.js";
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router()

router.get('/', getCollections);
router.get('/id/:id', getCollectionById)
router.get('/:slug', getCollectionBySlug);

router.post('/', protect, authorize('seller', 'admin'), createCollection);
router.put('/:id', protect, authorize('seller', 'admin'), updateCollection);
router.delete('/:id', protect, authorize('seller', 'admin'), deleteCollection);

export default router