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
        text: message,
        html: '<h1>Хорошего дня)</h1><img src="https://yt3.ggpht.com/ytc/AKedOLR8cnXZyyJhpZpczQ2vAer7j4WT1XG0EAvm2X-O=s900-c-k-c0x00ffffff-no-rj"/>'
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