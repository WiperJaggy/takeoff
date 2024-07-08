const nodemailer = require('nodemailer');

// Create a transporter object
 const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  service: 'hotmail',
  auth: {
    user: 'tracks47@hotmail.com',
    pass: 'getr#rit-nephipow9Lc'
  }
 });
 
 // Define the email template
 const userVerificationTemplate = (user) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Email Verification</title>
    </head>
    <body>
      <h1>Welcome to tracks!</h1>
      <p>To verify your email, please click the following link:</p>
      <a href="https://localhost:8080/auth/verify/${user.verificationToken}">Verify Email</a>
    </body>
    </html>
  `;
};

// Send the email
 exports.sendVerificationEmail = async (email, verificationToken) => {
  const mailOptions = {
    from: 'Tracks47@hotmail.com',
    to: email,
    subject: 'Email Verification',
    html: userVerificationTemplate({ verificationToken }),
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', email);
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};



exports.sendPasswordResetEmail = async (email, resetURL) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    service: 'hotmail',
    auth: {
      user: 'tracks47@hotmail.com',
      pass: 'getr#rit-nephipow9Lc'
    }
  });

  const mailOptions = {
    from: 'tracks47@hotmail.com',
    to: email,
    subject: 'Password Reset',
    html: `
      <p>Please click the button below to reset your password:</p>
      <a href="${resetURL}" style="display: inline-block; background-color: #007bff; color: #fff; text-decoration: none; padding: 10px 20px; border-radius: 5px;">
        Reset Password
      </a>
    `
  };

  // Send the email
  try {
  await transporter.sendMail(mailOptions);
  console.log('reset password email sent to:', email);
} catch (error) {
  console.error('Error sending verification email:', error);
}
};