const nodemailer = require('nodemailer');

// const sendEmail = async options =>{
// const transporter = nodemailer.createTransport({
//    //1.Create a transporter
//     // service:'Gmail'
//     host : process.env.EMAIL_HOST,
//     PORT : process.env.EMAIL_PORT,
//     auth :{
//         user : process.env.EMAIL_USERNAME,
//         pass : process.env.EMAIL_PASSWORD
//     }
//     //Activate in gmail "less secure app" option
// })
//     //2.Define the email options
//    const mailOptions = {
//     from : " Nizar miri <nizo.miri@hotmail.co.uk>",
//     to : options.email,
//     subject : options.subject,
//     text : options.message
//     //html:
//    }
//     //3.Actually send the email
//     await transporter.sendMail(mailOptions)
// }
// module.exports =sendEmail
// const formData = require('form-data');
// const Mailgun = require('mailgun.js');
// const mailgun = new Mailgun(formData);
// const mg = mailgun.client({username: 'api', key: process.env.MAILGUN_API_KEY || 'key-yourkeyhere'});

// mg.messages.create('sandbox-123.mailgun.org', {
// 	from: "Excited User <mailgun@sandbox-123.mailgun.org>",
// 	to: ["test@example.com"],
// 	subject: "Hello",
// 	text: "Testing some Mailgun awesomeness!",
// 	html: "<h1>Testing some Mailgun awesomeness!</h1>"
// })
// .then(msg => console.log(msg)) // logs response data
// .catch(err => console.log(err)); // logs any error

const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData)

const sendPasswordResetEmail = async ( email, resetLink) => {
  try {

    const mg = mailgun.client({
      username: 'api',
      key: process.env.API_KEY_RESET_PASSWORD,
    });

    const mailOptions = {
      from: 'tracks <tracks47@hotmail.com>',
      to: email,
      subject: 'Reset Your Password',
      html: `
      <p>Hi there,</p>
      <p>We received a request to reset your password. If this was you, please click the button below to reset your password:</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>If you didn't request a password reset, you can safely ignore this email.</p>
      <p>Best regards,<br>The Example Team</p>
    `,
    };

    await mg.messages.create(process.env.MAILGUN_DOMAIN, mailOptions);
    console.log('Password reset email sent successfully!');
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};








const sendVerificationEmail = async (email, verificationLink) => {
  try {
    const mg = mailgun(formData);
    const client = mg.client({
      username: 'api',
      key: process.env.API_KEY_EMAIL_VERIFICATION,
    });

    const mailOptions = {
      from: ' tracks <tracks47@hotmail.com>',
      to: email,
      subject: 'Verify Your Account',
      html: `
      <p>Hi there,</p>
      <p>Please click the button below to verify your email address:</</p>
      <a href="${verificationLink}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">Verify Email</a>
      <p>If you didn't request a verification, you can safely ignore this email.</p>
      <p>Best regards,<br>The Example Team</p>
    `,
    };

    await client.messages.create(process.env.MAILGUN_DOMAIN, mailOptions);
    console.log('Verification email sent successfully!');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};



module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};