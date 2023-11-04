const express = require('express')
const axios = require('axios')
const router = express.Router()
const { verifyMail } = require('../config/nodemailer');
const Crypto=require('../models/Crypto')
const notifier = require('node-notifier');
router.get('/', async(req, res) => {
    
    res.render('./userViews/post')

});
router.get('/data', async(req, res) => {

    const data = await axios.get(' https://api.kraken.com/0/public/AssetPairs');
    const allCryptoPair=data.data.result
    console.log(allCryptoPair)
    const allCryptoPairData=[]
    for (const key in allCryptoPair) {
        allCryptoPairData.push({'name':key,'altname':allCryptoPair[key].altname,'wsname':allCryptoPair[key].wsname,'base':allCryptoPair[key].base,'quote':allCryptoPair[key].quote})
    }
    console.log(allCryptoPairData)
    res.render('./userViews/index',{allCryptoPairData})

});
router.post('/', async(req, res) => {
    const { first,second,email}=req.body
    console.log(req.body,req.hostname, req.protocol)
    const { dataFirst } = await axios.get(` https://api.kraken.com/0/public/OHLC?pair=${first}`);
    const { dataSecond } = await axios.get(` https://api.kraken.com/0/public/OHLC?pair=${second}`);
    if(dataFirst && dataSecond){
        verifyMail(email,first,second, req.hostname, req.protocol)
    }
    res.redirect('/')

});



router.get('/verify/:email/:first/:second', async(req, res) => {
    const first=req.params.first
    const email=req.params.email
    const second=req.params.second
    const crypto = new Crypto({
        first,
        second,
        email,

    })
    let saveCrypto = await crypto.save()
    res.redirect('/')
});


module.exports = router
