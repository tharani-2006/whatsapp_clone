// EmailJS Configuration
// Replace these values with your actual EmailJS credentials

export const EMAILJS_CONFIG = {
  SERVICE_ID: 'YOUR_SERVICE_ID', // Your EmailJS service ID
  TEMPLATE_ID: 'YOUR_TEMPLATE_ID', // Your EmailJS template ID
  USER_ID: 'YOUR_USER_ID' // Your EmailJS user ID
};

// EmailJS Setup Instructions:
// 
// 1. Sign up at https://www.emailjs.com (free tier available)
// 2. Create a new Email Service:
//    - Go to Email Services tab
//    - Click "Add New Service"
//    - Choose your email provider (Gmail, Outlook, etc.)
//    - Follow the authentication steps
//    - Copy the Service ID
//
// 3. Create an Email Template:
//    - Go to Email Templates tab
//    - Click "Create New Template"
//    - Use this template structure:
//
//    Subject: WhatsApp Verification Code
//    Content:
//    Hello {{to_name}},
//
//    Your WhatsApp verification code is: {{otp_code}}
//
//    This code will expire in 10 minutes.
//    If you didn't request this code, please ignore this email.
//
//    Best regards,
//    WhatsApp Team
//
// 4. Copy the Template ID
//
// 5. Get your User ID:
//    - Go to Account tab
//    - Copy your Public Key (User ID)
//
// 6. Update the values above with your actual credentials
//
// 7. Test the integration by trying to register a new user

export default EMAILJS_CONFIG;
