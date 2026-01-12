import express from 'express';
import { getWishlist, toggleWishlist } from '../controller/wishlist.controller.js';
import { protect } from '../../middleware/auth.js';

const wishlistRouter = express.Router();

wishlistRouter.use(protect);

wishlistRouter.get('/', getWishlist);
wishlistRouter.post('/toggle', toggleWishlist);

export default wishlistRouter;
