# EmailJS OTP Verification Setup Guide

## Overview
This guide explains how to set up EmailJS OTP verification for your WhatsApp clone application, replacing the previous phone number OTP system.

## What Was Removed
- ✅ Phone number input field from registration
- ✅ Phone number validation in User model
- ✅ Twilio OTP service integration
- ✅ Phone number OTP routes in backend
- ✅ Phone number fields in database schema

## What Was Added
- ✅ EmailJS integration for OTP delivery
- ✅ Email-based OTP verification flow
- ✅ New OTP input UI in registration
- ✅ EmailJS configuration file
- ✅ Resend OTP functionality

## Step-by-Step Setup

### 1. Install EmailJS Dependency
```bash
cd client
npm install emailjs-com
```

### 2. Sign Up for EmailJS
1. Go to [https://www.emailjs.com](https://www.emailjs.com)
2. Create a free account
3. Verify your email address

### 3. Create Email Service
1. In EmailJS dashboard, go to "Email Services" tab
2. Click "Add New Service"
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow authentication steps for your provider
5. **Copy the Service ID** (you'll need this)

### 4. Create Email Template
1. Go to "Email Templates" tab
2. Click "Create New Template"
3. Use this template structure:

**Subject:** `WhatsApp Verification Code`

**Content:**
```
Hello {{to_name}},

Your WhatsApp verification code is: {{otp_code}}

This code will expire in 10 minutes.
If you didn't request this code, please ignore this email.

Best regards,
WhatsApp Team
```

4. **Copy the Template ID** (you'll need this)

### 5. Get Your User ID
1. Go to "Account" tab in EmailJS
2. **Copy your Public Key** (this is your User ID)

### 6. Update Configuration
1. Open `client/src/utils/emailjsConfig.js`
2. Replace the placeholder values:
   ```javascript
   export const EMAILJS_CONFIG = {
     SERVICE_ID: 'your_actual_service_id_here',
     TEMPLATE_ID: 'your_actual_template_id_here',
     USER_ID: 'your_actual_user_id_here'
   };
   ```

### 7. Test the Integration
1. Start your server: `cd server && npm start`
2. Start your client: `cd client && npm start`
3. Try to register a new user
4. Check if OTP email is received
5. Verify OTP and complete registration

## How It Works

### Registration Flow:
1. User fills in name, email, and password
2. Clicks "Send OTP" button
3. System generates 6-digit OTP
4. EmailJS sends OTP to user's email
5. User enters OTP in verification screen
6. System verifies OTP and creates account
7. User is logged in and redirected

### Security Features:
- OTP is stored temporarily in localStorage
- OTP expires after 10 minutes
- User can resend OTP if needed
- No sensitive data stored on server

## Troubleshooting

### Common Issues:

1. **"Failed to send OTP" error:**
   - Check EmailJS credentials in config file
   - Verify email service is properly connected
   - Check browser console for detailed errors

2. **OTP not received:**
   - Check spam/junk folder
   - Verify email address is correct
   - Check EmailJS dashboard for delivery status

3. **"Invalid OTP" error:**
   - Make sure you're entering the OTP from the latest email
   - Check if OTP has expired (10 minutes)
   - Try resending OTP

### Debug Steps:
1. Open browser console (F12)
2. Check for JavaScript errors
3. Verify EmailJS initialization
4. Check network requests
5. Verify localStorage values

## Production Considerations

### Security Improvements:
- Use secure session storage instead of localStorage
- Implement rate limiting for OTP requests
- Add CAPTCHA for OTP requests
- Use HTTPS in production

### EmailJS Limits:
- Free tier: ~200 emails/month
- Paid plans available for higher volumes
- Consider implementing email queue for high traffic

## Support

If you encounter issues:
1. Check EmailJS documentation: [https://www.emailjs.com/docs/](https://www.emailjs.com/docs/)
2. Verify all configuration values are correct
3. Test with a simple email template first
4. Check EmailJS dashboard for delivery reports

## Files Modified

- `client/package.json` - Added emailjs-com dependency
- `client/src/components/Register.jsx` - Implemented EmailJS OTP flow
- `client/src/components/Register.css` - Added OTP styling
- `client/src/utils/emailjsConfig.js` - EmailJS configuration
- `server/models/User.js` - Removed phone fields
- `server/routes/auth.js` - Removed OTP routes
- `server/utils/otpService.js` - Deleted (replaced by EmailJS)

## Next Steps

After setup:
1. Test the complete registration flow
2. Customize the email template design
3. Add email verification for existing users (optional)
4. Implement password reset via email (optional)
5. Add email preferences in user settings (optional)
