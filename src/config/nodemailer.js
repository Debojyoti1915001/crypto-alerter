const nodemailer = require('nodemailer')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const notifier = require('node-notifier');
const verifyMail = (email,first,second, host, protocol) => {
   
    const PORT = process.env.PORT || 3000
    const link = `${protocol}://${host}:${PORT}/verify/${email}/${first}/${second}`

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.NODEMAILER_EMAIL, //email id

            pass: process.env.NODEMAILER_PASSWORD, // gmail password
        },
    })
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: `${email}`,
        subject: 'Please confirm your Email for subscription',
        html:
            'Hello,<br> Please verify your email such that you get an alert when price of '+
            first
            +' is more than '+
            second
            +'.<br><a href=' +
            link +
            '>Click here to verify</a>',
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            notifier.notify({
                title: 'Mail Not Send!',
                message: 'Provide a correct mail address',
                sound: true,
                wait: true
              },)
            console.log('Error', error)
        } else {
            notifier.notify({
                title: 'Mail Sent!',
                message: 'Please check your mail and confirm upon the subscription',
                sound: true,
                wait: true
              },)
            console.log('Email sent: ')
        }
    })
}



module.exports = {
    verifyMail,
}