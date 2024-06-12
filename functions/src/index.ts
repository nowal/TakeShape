import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as nodemailer from 'nodemailer';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Configure the email transport using the default SMTP transport and a GMail account.
// For GMail, enable "Allow less secure apps" under account settings.
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'dwelldoneupdates@gmail.com',
    pass: 'dwvo zrkc uqny gkip',
  },
});

// Function to send an email
exports.sendEmailNotification = functions.firestore.document('userImages/{userImageId}')
  .onCreate(async (snap: functions.firestore.QueryDocumentSnapshot, context: functions.EventContext) => {
    const userImage = snap.data();

    const mailOptions = {
      from: 'dwelldoneupdates@gmail.com',
      to: 'waldronnoah@gmail.com', // List of recipients
      subject: 'New Quote Submitted',
      text: `A new quote has been submitted: ${JSON.stringify(userImage, null, 2)}`,
    };

    try {
      await mailTransport.sendMail(mailOptions);
      console.log('New quote email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error);
    }
  });
