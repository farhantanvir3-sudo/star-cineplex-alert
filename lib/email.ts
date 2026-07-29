import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.GMAIL_USER,
    clientId: process.env.GMAIL_CLIENT_ID,
    clientSecret: process.env.GMAIL_CLIENT_SECRET,
    refreshToken: process.env.GMAIL_REFRESH_TOKEN,
  },
});

export const sendTicketAlert = async (date: string) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: process.env.MY_DESTINATION_EMAILS,
    subject: `🚨 SKS Tower Tickets Dropped for ${date}!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #e50914;">🚨 Tickets are now available!</h2>
        <p style="font-size: 16px; color: #333;">Movie tickets for <strong>SKS Tower</strong> on <strong>${date}</strong> are now available at Star Cineplex.</p>
        <p style="font-size: 16px; color: #333;">Go grab them before they sell out!</p>
        <a href="https://www.cineplexbd.com/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background-color: #e50914; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit Star Cineplex BD</a>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully for date ${date}:`, result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
