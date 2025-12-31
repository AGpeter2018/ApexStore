import express from 'express';
import { handlePaystackWebhook, handleFlutterwaveWebhook } from '../controller/webhook.controller.js';

const webhookRouter = express.Router();

// Using raw body might be needed for Paystack signature verification if app.use(express.json()) is already active
// But usually express.json() is fine if the gateway sends standard JSON.
webhookRouter.post('/paystack', handlePaystackWebhook);
webhookRouter.post('/flutterwave', handleFlutterwaveWebhook);

export default webhookRouter;
