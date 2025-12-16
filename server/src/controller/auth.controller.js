import crypto from 'crypto';
import User from '../../models/User.model.js'
import PasswordReset from '../../models/PasswordReset.model.js';
import nodemailer from 'nodemailer'; 

// Request password reset
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Check if user exists
        const user = await User.findOne({ email });

        if (!user) {
            console.log("⚠ No user found with email:", email);
            return res.status(200).json({
                success: true,
                message:
                    "If an account exists with this email, you will receive a password reset link",
            });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");

        // Save token record
        await PasswordReset.create({
            user: user._id,
            resetToken: hashedToken,
            expiresAt: Date.now() + 3600000, // 1 hour
        });

        // Build reset link
        const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
        console.log("🔗 Reset URL:", resetUrl);

        // Configure SendGrid SMTP
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST, // smtp.sendgrid.net
            port: Number(process.env.EMAIL_PORT), // 587
            secure: false, // Required for SendGrid (STARTTLS)
            auth: {
                user: process.env.EMAIL_USER, // "apikey"
                pass: process.env.EMAIL_PASS, // sendgrid api key
            },
        });

        // Email content
        const mailOptions = {
            from: `"${process.env.APP_NAME}" <${process.env.EMAIL_FROM}>`,
            to: email,
            subject: "Password Reset Request",
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested a password reset. Click below:</p>
                <a href="${resetUrl}" 
                   style="padding: 10px 20px; background-color: #ea580c; 
                   color: white; border-radius: 5px; text-decoration: none;">
                    Reset Password
                </a>
                <p>This link expires in 1 hour.</p>
            `,
        };


        console.log("📨 Reset request received for:", email);
console.log("📌 Using email host:", process.env.EMAIL_HOST);
console.log("📌 Using email user:", process.env.EMAIL_USER);
console.log("📌 Reset URL:", resetUrl);


        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully:", info.response);

        return res.status(200).json({
            success: true,
            message: "Password reset link sent to your email",
        });
    } catch (error) {
        console.error("❌ Forgot password error:", error);

        return res.status(500).json({
            success: false,
            message: "Error sending reset email",
            error: error.message,
        });
    }
};


// Reset password
export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({
                success: false,
                message: 'Password is required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters'
            });
        }

        // Hash the token
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find valid reset token
        const resetRecord = await PasswordReset.findOne({
            resetToken: hashedToken,
            expiresAt: { $gt: Date.now() },
            used: false
        });

        if (!resetRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }

        // Find user and update password
        const user = await User.findById(resetRecord.user);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Update password (will be hashed by pre-save hook)
        user.password = password;
        await user.save();

        // Mark token as used
        resetRecord.used = true;
        await resetRecord.save();

        res.status(200).json({
            success: true,
            message: 'Password reset successful. You can now login with your new password.'
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Error resetting password',
            error: error.message
        });
    }
};
