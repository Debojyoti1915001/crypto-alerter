const nodemailer = require('nodemailer')
require('dotenv').config()
const jwt = require('jsonwebtoken')
const notifier = require('node-notifier');
const verifyMail = async(email,symbol, host, protocol) => {
   
    const PORT = process.env.PORT || 3000
    const link = `https://crypto-alerter01.onrender.com/verify/${email}/${symbol}`

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'verifier.1915001@gmail.com', //email id

            pass: 'trixochehfdajauu', // gmail password
        },
    })
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: `${email}`,
        subject: 'Please confirm your Email for subscription',
        html:
            'Hello,<br> Please verify your email such that you get an alert when price of '+
            symbol
            +' Slow EMA is more than Fast EMA'
           
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


const alertMail = async(email,symbol,f,s, host, protocol) => {
    const PORT = process.env.PORT || 3000
    const link = `https://crypto-alerter01.onrender.com/delete/${email}/${symbol}`
    // const link = `https://localhost:3000/delete/${email}/${symbol}`

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'cryptoalerter01@gmail.com', //email id

            pass: 'gtqnjjghyumyaxns', // gmail password
        },
    })
    console.log(link)
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: `${email}`,
        subject: `Alert from Crypto Alerter`,
        html:
            `Hello,<br> For ${symbol} Slow EMA has reached above fast EMA <br>Slow EMA : ${s} <br>Fast EMA :  ${f}
            <br>
            <a href="${link}">Click Here To Unsubscribe</a>
            `,
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error', error)
        } else {
            console.log('Email sent: ')
        }
    })
}

const alertDownMail = async(email,symbol,f,s, host, protocol) => {
    const link = `https://crypto-alerter01.onrender.com/delete/${email}/${symbol}`
    // const link = `https://localhost:3000/delete/${email}/${symbol}`

    var transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: 'cryptoalerter01@gmail.com', //email id

            pass: 'gtqnjjghyumyaxns', // gmail password
        },
    })
    console.log(link)
    var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: `${email}`,
        subject: `Alert from Crypto Alerter`,
        html:
            `Hello,<br> For ${symbol} MACD is decreasing rapidly
            <br>
            <a href="${link}">Click Here To Unsubscribe</a>
            `,
    }
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log('Error', error)
        } else {
            console.log('Email sent: ')
        }
    })
}

module.exports = {
    verifyMail,
    alertMail,
    alertDownMail
}
