import express from 'express';
import { 
    // register, 
    // login, 
    forgotPassword, 
    resetPassword 
} from '../controller/auth.controller.js';

const authRouter = express.Router();

// authRouter.post('/register', register);
// authRouter.post('/login', login);
authRouter.post('/forgot-password', forgotPassword);
authRouter.post('/reset-password/:token', resetPassword);

export default authRouter;