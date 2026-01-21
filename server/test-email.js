require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
    console.log('--- Testing Email Configuration ---');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '********' : '(not set)');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('ERROR: EMAIL_USER or EMAIL_PASS not set in .env');
        return;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    try {
        console.log('Attempting to send email...');
        const info = await transporter.sendMail({
            from: `"Test Script" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to self
            subject: 'Test Email from Lumina Store Debugger',
            text: 'If you receive this, Nodemailer is working correctly!'
        });
        console.log('SUCCESS: Email sent!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('FAILED: Could not send email.');
        console.error(error);
    }
}

testEmail();
