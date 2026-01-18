import nodemailer from 'nodemailer';

// Create transporter (configure with your email service)
const createTransporter = () => {
    // If SMTP settings are provided in .env, use them
    if (process.env.EMAIL_HOST &&
        process.env.EMAIL_USER &&
        process.env.EMAIL_PASSWORD &&
        process.env.EMAIL_USER !== 'undefined' &&
        process.env.EMAIL_PASSWORD !== 'undefined') {

        console.log('Using SMTP Configuration for email');
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Fallback: Return a MOCK transporter that behaves like nodemailer but sends nothing
    console.log(' [MOCK-EMAIL] Using Mock Transporter (No Email Sent)');
    return {
        sendMail: async (mailOptions) => {
            console.log(' [MOCK-EMAIL] ---------------------------------------------------');
            console.log(` [MOCK-EMAIL] To: ${mailOptions.to}`);
            console.log(` [MOCK-EMAIL] Subject: ${mailOptions.subject}`);
            console.log(' [MOCK-EMAIL] (Email content suppressed for brevity)');
            console.log(' [MOCK-EMAIL] ---------------------------------------------------');
            return { messageId: 'mock-email-id-' + Date.now() };
        }
    };
};

// Send order confirmation email
export const sendOrderConfirmationEmail = async (order, user) => {
    try {
        const transporter = createTransporter();

        const itemsList = order.items.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    ${item.name} x ${item.quantity}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    ₦${(item.price * item.quantity).toLocaleString()}
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"ApexStore" <${process.env.EMAIL_FROM || 'noreply@apexstore.com'}>`,
            to: user.email,
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .total { font-size: 18px; font-weight: bold; color: #667eea; margin-top: 20px; text-align: right; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Thank You for Your Order!</h1>
                            <p>Order #${order.orderNumber}</p>
                        </div>
                        <div class="content">
                            <p>Hi ${user.name},</p>
                            <p>We've received your order and it's being processed. Here are the details:</p>
                            
                            <div class="order-details">
                                <h3>Order Items</h3>
                                <table>
                                    ${itemsList}
                                </table>
                                
                                <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #667eea;">
                                    <table>
                                        <tr>
                                            <td>Subtotal:</td>
                                            <td style="text-align: right;">₦${order.subtotal.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td>Shipping Fee:</td>
                                            <td style="text-align: right;">₦${order.shippingFee.toLocaleString()}</td>
                                        </tr>
                                        <tr>
                                            <td>Tax:</td>
                                            <td style="text-align: right;">₦${order.tax.toLocaleString()}</td>
                                        </tr>
                                    </table>
                                    <p class="total">Total: ₦${order.total.toLocaleString()}</p>
                                </div>
                            </div>
                            
                            <div class="order-details">
                                <h3>Shipping Address</h3>
                                <p>
                                    ${order.shippingAddress.name}<br>
                                    ${order.shippingAddress.phone}<br>
                                    ${order.shippingAddress.street}<br>
                                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                                    ${order.shippingAddress.country}
                                </p>
                            </div>
                            
                            <div class="order-details">
                                <h3>Payment Information</h3>
                                <p>
                                    <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br>
                                    <strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}
                                </p>
                            </div>
                            
                            <p>We'll send you another email when your order ships.</p>
                            
                            <center>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders/${order._id}" class="button">
                                    Track Your Order
                                </a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order confirmation email sent:', info.messageId);

        // Log preview URL for development
        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending order confirmation email:', error);
        throw error;
    }
};

// Send order status update email
export const sendOrderStatusUpdateEmail = async (order, user, newStatus) => {
    try {
        const transporter = createTransporter();

        const statusMessages = {
            processing: 'Your order is being prepared',
            shipped: 'Your order has been shipped',
            delivered: 'Your order has been delivered',
            cancelled: 'Your order has been cancelled'
        };

        const mailOptions = {
            from: `"ApexStore" <${process.env.EMAIL_FROM || 'noreply@apexstore.com'}>`,
            to: user.email,
            subject: `Order Update - ${order.orderNumber}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .status-badge { display: inline-block; padding: 10px 20px; background: #4CAF50; color: white; border-radius: 20px; font-weight: bold; margin: 20px 0; }
                        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>Order Status Update</h1>
                            <p>Order #${order.orderNumber}</p>
                        </div>
                        <div class="content">
                            <p>Hi ${user.name},</p>
                            <p>${statusMessages[newStatus] || 'Your order status has been updated'}.</p>
                            
                            <center>
                                <span class="status-badge">${newStatus.toUpperCase()}</span>
                            </center>
                            
                            ${order.trackingNumber ? `
                                <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
                            ` : ''}
                            
                            ${newStatus === 'cancelled' && order.cancelReason ? `
                                <p><strong>Cancellation Reason:</strong> ${order.cancelReason}</p>
                            ` : ''}
                            
                            <center>
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/my-orders/${order._id}" class="button">
                                    View Order Details
                                </a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Order status update email sent:', info.messageId);

        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error('Error sending order status update email:', error);
        throw error;
    }
};

// Send order notification email to vendor
export const sendVendorOrderNotificationEmail = async (order, vendor, vendorItems) => {
    try {
        const transporter = createTransporter();

        const itemsList = vendorItems.map(item => `
            <tr>
                <td style="padding: 10px; border-bottom: 1px solid #eee;">
                    ${item.name} x ${item.quantity}
                </td>
                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
                    ₦${(item.price * item.quantity).toLocaleString()}
                </td>
            </tr>
        `).join('');

        const mailOptions = {
            from: `"ApexStore" <${process.env.EMAIL_FROM || 'noreply@apexstore.com'}>`,
            to: vendor.email,
            subject: `New Order Received - #${order.orderNumber}`,
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                        .header { background: #4CAF50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                        .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
                        .total { font-size: 18px; font-weight: bold; color: #4CAF50; margin-top: 20px; text-align: right; }
                        .button { display: inline-block; padding: 12px 30px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
                        table { width: 100%; border-collapse: collapse; }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <div class="header">
                            <h1>You Have a New Order!</h1>
                            <p>Order #${order.orderNumber}</p>
                        </div>
                        <div class="content">
                            <p>Hi ${vendor.name},</p>
                            <p>Great news! A new order has been placed for your products. Please review the details below and prepare for fulfillment.</p>
                            
                            <div class="order-details">
                                <h3>Expected Items</h3>
                                <table>
                                    ${itemsList}
                                </table>
                            </div>
                            
                            <div class="order-details">
                                <h3>Customer Info</h3>
                                <p>
                                    <strong>Name:</strong> ${order.shippingAddress.name}<br>
                                    <strong>Phone:</strong> ${order.shippingAddress.phone}
                                </p>
                            </div>
                            
                            <center>
                                <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/vendor/orders/${order._id}" class="button">
                                    View Order in Dashboard
                                </a>
                            </center>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Vendor order notification sent to ${vendor.email}:`, info.messageId);
        return info;
    } catch (error) {
        console.error(`Error sending vendor order notification to ${vendor.email}:`, error);
        // Don't throw - we don't want to crash checkout if one vendor's email fails
    }
};

// Send dispute opened email
export const sendDisputeOpenedEmail = async (dispute, order, customer, vendor) => {
    try {
        const transporter = createTransporter();
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // Notify Vendor
        const vendorMailOptions = {
            from: `"ApexStore Resolution" <${process.env.EMAIL_FROM || 'noreply@apexstore.com'}>`,
            to: vendor.email,
            subject: `New Dispute Opened - Order #${order.orderNumber}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #d32f2f;">New Dispute Received</h2>
                    <p>Hi ${vendor.name},</p>
                    <p>A customer has opened a dispute for <strong>Order #${order.orderNumber}</strong>.</p>
                    <div style="background: #fff5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Reason:</strong> ${dispute.reason.replace('_', ' ')}</p>
                        <p><strong>Description:</strong> ${dispute.description}</p>
                    </div>
                    <p>Please log in to your dashboard to respond to this claim within 48 hours.</p>
                    <a href="${frontendUrl}/disputes/${dispute._id}" style="display: inline-block; padding: 12px 25px; background: #d32f2f; color: white; text-decoration: none; border-radius: 5px;">View Case & Respond</a>
                </div>
            `
        };

        await transporter.sendMail(vendorMailOptions);

        // Notify Admin
        const adminMailOptions = {
            from: `"ApexStore System" <${process.env.EMAIL_FROM || 'noreply@apexstore.com'}>`,
            to: process.env.ADMIN_EMAIL || 'admin@apexstore.com',
            subject: `[ALERT] New Dispute - Order #${order.orderNumber}`,
            html: `<p>New dispute opened for Order #${order.orderNumber}. <a href="${frontendUrl}/disputes/${dispute._id}">Click here to view</a></p>`
        };

        await transporter.sendMail(adminMailOptions);

    } catch (error) {
        console.error('Error sending dispute opened email:', error);
    }
};

// Send dispute response notification
export const sendDisputeResponseEmail = async (dispute, sender, recipient) => {
    try {
        const transporter = createTransporter();
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

        const mailOptions = {
            from: `"ApexStore Resolution" <${process.env.EMAIL_FROM || 'noreply@apexstore.com'}>`,
            to: recipient.email,
            subject: `New Message in Dispute - Case #${dispute._id.slice(-8).toUpperCase()}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h3>New Update from ${sender.name} (${sender.role})</h3>
                    <p>There is a new message in the dispute for your order.</p>
                    <p style="padding: 15px; background: #f5f5f5; border-radius: 5px; font-style: italic;">
                        "${dispute.responses[dispute.responses.length - 1].message}"
                    </p>
                    <a href="${frontendUrl}/disputes/${dispute._id}" style="display: inline-block; padding: 12px 25px; background: #667eea; color: white; text-decoration: none; border-radius: 5px;">View Full Conversation</a>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending dispute response email:', error);
    }
};

// Send dispute resolution notification
export const sendDisputeResolvedEmail = async (dispute, order, customer, vendor) => {
    try {
        const transporter = createTransporter();
        const frontendUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        const recipients = [customer, vendor];

        for (const recipient of recipients) {
            const mailOptions = {
                from: `"ApexStore Resolution" <${process.env.EMAIL_FROM || 'noreply@apexstore.com'}>`,
                to: recipient.email,
                subject: `Final Decision: Dispute for Order #${order.orderNumber}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; border-top: 5px solid #4CAF50;">
                        <h2 style="color: #4CAF50;">Dispute Resolved</h2>
                        <p>Hi ${recipient.name},</p>
                        <p>The administration has made a final decision regarding the dispute for <strong>Order #${order.orderNumber}</strong>.</p>
                        <div style="background: #f1f8e9; padding: 20px; border-radius: 10px; margin: 20px 0;">
                            <p><strong>Action Taken:</strong> <span style="text-transform: uppercase; font-weight: bold; color: #2e7d32;">${dispute.adminDecision.action.replace('_', ' ')}</span></p>
                            <p><strong>Ruling Note:</strong> ${dispute.adminDecision.note}</p>
                        </div>
                        <p>This decision is binding and the case is now closed.</p>
                        <a href="${frontendUrl}/disputes/${dispute._id}" style="display: inline-block; padding: 12px 25px; background: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">View Resolution Details</a>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
        }
    } catch (error) {
        console.error('Error sending dispute resolved email:', error);
    }
};
