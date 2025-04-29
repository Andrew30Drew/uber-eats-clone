// require('dotenv').config();
// const { sendPaymentConfirmation } = require('./emailService');

// // Dummy data for testing
// const testEmail = 'ugthamindudilaa@gmail.com'; // <-- Replace with your email to receive the test
// const paymentDetails = {
//   customerId: 'CUST12345',  
//   userName: 'John Doe',   
//   paymentID: 'PAYMENT98765',  
//   restaurantOrderId: 'TEST123456',
//   amount: 2500,
//   currency: 'LKR',
//   paidAt: new Date(),
//   paypalOrderId: 'PAYPALTESTID98765',
// };

// sendPaymentConfirmation(testEmail, paymentDetails)
//   .then(sent => {
//     if (sent) {
//       console.log('✅ Test email sent successfully!');
//     } else {
//       console.log('❌ Failed to send test email.');
//     }
//     process.exit(0);
//   })
//   .catch(err => {
//     console.error('❌ Error sending test email:', err);
//     process.exit(1);
//   });