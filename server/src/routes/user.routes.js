import express from 'express';
import {
    register,
    login,
    getUsers,
    updateUserRole,
    deactivateUser,
    verifyUser,
    getUserStats
} from '../controller/user.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);
userRouter.get('/', protect, authorize('admin'), getUsers);
userRouter.get('/stats', protect, authorize('admin'), getUserStats);
userRouter.put('/:id/role', protect, authorize('admin'), updateUserRole);
userRouter.put('/:id/deactivate', protect, authorize('admin'), deactivateUser);
userRouter.put('/:id/verify', protect, authorize('admin'), verifyUser);

export default userRouter;
