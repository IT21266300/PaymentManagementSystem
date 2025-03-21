const sendEmailNotification = (to, subject, message) => {
  console.log(`Email sent to ${to}: Subject - ${subject}, Message - ${message}`);
};

module.exports = { sendEmailNotification };