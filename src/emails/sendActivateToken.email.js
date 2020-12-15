const sgMail = require('./sgMail.email');

const sendActivateToken = (email, token) => {
  sgMail.send({
    from: 'huaanhminh0412@gmail.com',
    to: email,
    subject: 'Confirm email address',
    text: `Here is your code to confirm email: ${token}. This code will expired in 10 minutes. Keep it secretly.`,
  });
};

module.exports = sendActivateToken;
