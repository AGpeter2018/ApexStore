import express from "express";
import { getCollections, getCollectionBySlug, createCollection, updateCollection, deleteCollection, getCollectionById} from "../controller/product-collection.js";

const router = express.Router()

router.get('/', getCollections);
router.post('/', createCollection);

router.get('/id/:id', getCollectionById)
router.put('/:id', updateCollection);
router.delete('/:id', deleteCollection);

router.get('/:slug', getCollectionBySlug);
export default router