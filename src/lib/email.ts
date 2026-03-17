/**
 * Email Service using Resend
 *
 * Handles all transactional emails for the platform:
 * - Doctor registration confirmations
 * - Lead notifications
 * - Password resets
 * - Booking confirmations
 * - Payment receipts
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || 'AIHealz <noreply@aihealz.com>';
const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || 'support@aihealz.com';

interface EmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    tags?: Array<{ name: string; value: string }>;
}

interface EmailResult {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * Send an email using Resend API
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!RESEND_API_KEY) {
        console.error('[Email] RESEND_API_KEY not configured');
        return { success: false, error: 'Email service not configured' };
    }

    try {
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: FROM_EMAIL,
                to: Array.isArray(options.to) ? options.to : [options.to],
                subject: options.subject,
                html: options.html,
                text: options.text,
                reply_to: options.replyTo || SUPPORT_EMAIL,
                tags: options.tags,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('[Email] Resend API error:', data);
            return { success: false, error: data.message || 'Failed to send email' };
        }

        console.log('[Email] Sent successfully:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('[Email] Error sending email:', error);
        return { success: false, error: 'Network error sending email' };
    }
}

/**
 * Email Templates
 */

export async function sendWelcomeEmail(email: string, name: string): Promise<EmailResult> {
    return sendEmail({
        to: email,
        subject: 'Welcome to AIHealz - Your Medical Profile is Ready!',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                    <h1 style="color: #14b8a6; margin: 0; font-size: 28px;">Welcome to AIHealz!</h1>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                    <p style="font-size: 18px;">Hello Dr. ${name},</p>
                    <p>Your medical professional profile has been created successfully on AIHealz. You're now part of India's leading AI-powered healthcare platform!</p>

                    <h3 style="color: #0f172a;">What's Next?</h3>
                    <ul style="padding-left: 20px;">
                        <li>Complete your profile with specializations and availability</li>
                        <li>Add your clinic/hospital affiliations</li>
                        <li>Set up your consultation preferences</li>
                        <li>Start receiving patient leads</li>
                    </ul>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="https://aihealz.com/provider/dashboard"
                           style="background: #14b8a6; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                            Go to Dashboard
                        </a>
                    </div>

                    <p style="color: #64748b; font-size: 14px;">
                        If you have any questions, reply to this email or contact us at support@aihealz.com
                    </p>
                </div>
                <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
                    <p>© ${new Date().getFullYear()} AIHealz. All rights reserved.</p>
                    <p>You're receiving this because you registered on aihealz.com</p>
                </div>
            </body>
            </html>
        `,
        tags: [{ name: 'type', value: 'welcome' }],
    });
}

export async function sendLeadNotification(
    doctorEmail: string,
    doctorName: string,
    patientName: string,
    condition: string,
    city: string
): Promise<EmailResult> {
    return sendEmail({
        to: doctorEmail,
        subject: `New Patient Lead: ${condition} in ${city}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 20px 30px; border-radius: 12px 12px 0 0;">
                    <h2 style="color: #14b8a6; margin: 0;">🔔 New Patient Lead</h2>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                    <p>Hello Dr. ${doctorName},</p>
                    <p>You have received a new patient inquiry through AIHealz:</p>

                    <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p style="margin: 5px 0;"><strong>Patient:</strong> ${patientName}</p>
                        <p style="margin: 5px 0;"><strong>Condition:</strong> ${condition}</p>
                        <p style="margin: 5px 0;"><strong>Location:</strong> ${city}</p>
                    </div>

                    <div style="text-align: center; margin: 25px 0;">
                        <a href="https://aihealz.com/provider/dashboard"
                           style="background: #14b8a6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600;">
                            View Lead Details
                        </a>
                    </div>

                    <p style="color: #64748b; font-size: 13px;">
                        Respond quickly to improve your conversion rate. Patients typically choose doctors who respond within 2 hours.
                    </p>
                </div>
            </body>
            </html>
        `,
        tags: [{ name: 'type', value: 'lead_notification' }],
    });
}

export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<EmailResult> {
    const resetUrl = `https://aihealz.com/provider/reset-password?token=${resetToken}`;

    return sendEmail({
        to: email,
        subject: 'Reset Your AIHealz Password',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #0f172a; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #14b8a6; margin: 0;">Password Reset</h1>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                    <p>You requested to reset your password for your AIHealz account.</p>
                    <p>Click the button below to set a new password:</p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}"
                           style="background: #14b8a6; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
                            Reset Password
                        </a>
                    </div>

                    <p style="color: #64748b; font-size: 13px;">
                        This link will expire in 1 hour. If you didn't request this, please ignore this email.
                    </p>

                    <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">

                    <p style="color: #94a3b8; font-size: 12px;">
                        If the button doesn't work, copy and paste this URL into your browser:<br>
                        <a href="${resetUrl}" style="color: #14b8a6; word-break: break-all;">${resetUrl}</a>
                    </p>
                </div>
            </body>
            </html>
        `,
        tags: [{ name: 'type', value: 'password_reset' }],
    });
}

export async function sendBookingConfirmation(
    patientEmail: string,
    patientName: string,
    doctorName: string,
    appointmentDate: string,
    appointmentTime: string,
    clinicAddress: string
): Promise<EmailResult> {
    return sendEmail({
        to: patientEmail,
        subject: `Appointment Confirmed with ${doctorName}`,
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                    <h1 style="color: #fff; margin: 0;">✓ Appointment Confirmed</h1>
                </div>
                <div style="background: #fff; padding: 30px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
                    <p>Hello ${patientName},</p>
                    <p>Your appointment has been confirmed. Here are the details:</p>

                    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
                        <p style="margin: 8px 0;"><strong>Doctor:</strong> ${doctorName}</p>
                        <p style="margin: 8px 0;"><strong>Date:</strong> ${appointmentDate}</p>
                        <p style="margin: 8px 0;"><strong>Time:</strong> ${appointmentTime}</p>
                        <p style="margin: 8px 0;"><strong>Location:</strong> ${clinicAddress}</p>
                    </div>

                    <h3 style="color: #0f172a;">What to bring:</h3>
                    <ul style="padding-left: 20px; color: #475569;">
                        <li>Valid ID proof</li>
                        <li>Previous medical records (if any)</li>
                        <li>Current medications list</li>
                        <li>Insurance card (if applicable)</li>
                    </ul>

                    <p style="color: #64748b; font-size: 13px; margin-top: 20px;">
                        Need to reschedule? Contact us at support@aihealz.com
                    </p>
                </div>
            </body>
            </html>
        `,
        tags: [{ name: 'type', value: 'booking_confirmation' }],
    });
}

export async function sendContactFormNotification(
    name: string,
    email: string,
    subject: string,
    message: string
): Promise<EmailResult> {
    return sendEmail({
        to: SUPPORT_EMAIL,
        subject: `[Contact Form] ${subject}`,
        replyTo: email,
        html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: sans-serif; padding: 20px;">
                <h2>New Contact Form Submission</h2>
                <p><strong>From:</strong> ${name} (${email})</p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 8px;">${message}</p>
            </body>
            </html>
        `,
        tags: [{ name: 'type', value: 'contact_form' }],
    });
}
