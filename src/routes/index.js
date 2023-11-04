const express = require('express')
const axios = require('axios')
const router = express.Router()

const Crypto=require('../models/Crypto')
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
    
    const crypto = new Crypto({
        first,
        second,
        email,

    })
    let saveCrypto = await crypto.save()
    res.redirect('/')

});






module.exports = router
