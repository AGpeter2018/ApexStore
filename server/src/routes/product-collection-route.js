import express from "express";
import { getCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection} from "../controller/product-collection.js";

const router = express.Router()

router.get('/', getCollections);
router.get('/:slug', getCollectionBySlug);
router.post('/', createCollection);
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

export default router