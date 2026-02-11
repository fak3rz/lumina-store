require('dotenv').config();
const nodemailer = require('nodemailer');

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS;

console.log('Testing Email Configuration...');
console.log(`User: ${emailUser ? emailUser : 'MISSING'}`);
console.log(`Pass: ${emailPass ? '******' : 'MISSING'}`);

if (!emailUser || !emailPass) {
    console.error('❌ EMAIL_USER or EMAIL_PASS is missing in .env');
    process.exit(1);
}

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: emailUser.trim(),
        pass: emailPass.replace(/\s+/g, '') // Remove all spaces just in case
    }
});

const targetEmail = process.argv[2] || emailUser;

async function sendTestEmail() {
    try {
        console.log(`Sending email FROM: ${emailUser} TO: ${targetEmail}...`);
        const info = await transporter.sendMail({
            from: `"Lumina Test" <${emailUser}>`,
            to: targetEmail,
            subject: 'Test Email from Lumina Store',
            text: `If you receive this at ${targetEmail}, your email configuration is working!`,
            html: `<b>If you receive this at ${targetEmail}, your email configuration is working!</b>`
        });

        console.log('✅ Email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log(`Check inbox of ${targetEmail}`);
    } catch (error) {
        console.error('❌ Failed to send email:', error);
    }
}

sendTestEmail();
