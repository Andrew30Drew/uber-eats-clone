const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendPaymentConfirmation = async (userEmail, paymentDetails) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Payment Confirmation - Food Ordering System",
      html: `
        <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 28px;">
            <h2 style="color: #4CAF50; text-align: center; margin-bottom: 16px;">Payment Confirmation</h2>
            <p style="font-size: 16px; color: #333;">Dear Customer,</p>
            <p style="font-size: 16px; color: #333;">Thank you for your payment! Your transaction has been successfully processed.</p>
            <h3 style="color: #333; border-bottom: 1px solid #eee; padding-bottom: 8px;">Payment Details</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px; color: #555;">Customer ID:</td>
                <td style="padding: 8px; color: #111;"><strong>${
                  paymentDetails.customerId
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #555;">Customer Name:</td>
                <td style="padding: 8px; color: #111;"><strong>${
                  paymentDetails.userName
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #555;">Payment ID:</td>
                <td style="padding: 8px; color: #111;"><strong>${
                  paymentDetails.paymentID
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #555;">Order ID:</td>
                <td style="padding: 8px; color: #111;"><strong>${
                  paymentDetails.restaurantOrderId
                }</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #555;">Amount:</td>
                <td style="padding: 8px; color: #111;"><strong>${
                  paymentDetails.amount
                } "LKR"</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #555;">Payment Date:</td>
                <td style="padding: 8px; color: #111;"><strong>${new Date(
                  paymentDetails.paidAt
                ).toLocaleString()}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; color: #555;">Transaction ID:</td>
                <td style="padding: 8px; color: #111;"><strong>${
                  paymentDetails.paypalOrderId
                }</strong></td>
              </tr>
            </table>
            <p style="font-size: 15px; color: #888; margin-top: 24px;">This is an automated email. Please do not reply.</p>
            <div style="text-align: center; margin-top: 32px;">
              <span style="font-size: 13px; color: #bbb;">&copy; ${new Date().getFullYear()} Cloud-Native Food Ordering System</span>
            </div>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

module.exports = {sendPaymentConfirmation};
