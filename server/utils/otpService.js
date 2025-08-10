const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendOTP = async (phone, otp) => {
  try {
    await client.messages.create({
      body: `Your WhatsApp verification code is: ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+${phone}`
    });
    return true;
  } catch (error) {
    console.error('Error sending OTP:', error);
    return false;
  }
};

module.exports = {
  generateOTP,
  sendOTP
};