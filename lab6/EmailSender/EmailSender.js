const nodemailer = require('nodemailer');
const sendEmail = (emailFrom, password, emailTo, message) => {
    const transporter = nodemailer.createTransport({
        service: 'mail.ru',
        auth: {
            user: emailFrom,
            pass: password
        }
    });
    const mailOptions = {
        from: emailFrom,
        to: emailTo,
        subject: 'Sending Email using Node.js',
        text: message
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

module.exports = sendEmail;