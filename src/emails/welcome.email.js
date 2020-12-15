const sgMail = require('./sgMail.email');

const sendWelcomeToNewUser = (email, fullname) => {
  sgMail.send({
    from: 'huaanhminh0412@gmail.com',
    to: email,
    subject: 'A friendly hello from Nodemy',
    text: `Hello ${fullname}. We are glad that you have joined our platform. If there is anything, contact us at email huaanhminh0412@gmail.com`,
  });
};

module.exports = sendWelcomeToNewUser;
