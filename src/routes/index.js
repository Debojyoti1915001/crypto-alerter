const express = require('express')
const axios = require('axios')
const router = express.Router()
const { verifyMail } = require('../config/nodemailer');
const Crypto = require('../models/Crypto')
const notifier = require('node-notifier');


const ccxt = require('ccxt');
const technicalindicators = require('technicalindicators');
router.get('/', async (req, res) => {
  res.render('./userViews/post')
});

router.get('/data', async (req, res) => {


  const exchange = new ccxt.binance(); // Change this to your desired exchange
  var allCryptoPairData=[]
  try {
    await exchange.loadMarkets();
    const symbols = Object.keys(exchange.markets);
    console.log('Available Symbols:', symbols);
    allCryptoPairData=symbols
  } catch (error) {
    console.error('Error fetching symbols:', error.message);
  }
  res.render('./userViews/index', { allCryptoPairData })
});

router.post('/', async (req, res) => {
  // Function to fetch historical price data
  // Function to fetch historical price data
  async function fetchHistoricalData(symbol, timeframe, limit) {
    const exchange = new ccxt.binance(); // Change this to your desired exchange
    const ohlcv = await exchange.fetchOHLCV(symbol, timeframe, undefined, limit);
    return ohlcv.map(data => data[4]); // Closing prices
  }

  // Function to calculate MACD
  function calculateMACD(data) {
    return new Promise((resolve, reject) => {
      tulind.indicators.macd.indicator([data], [12, 26, 9], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve({
            fastMACD: results[0],
            slowMACD: results[1],
            signalLine: results[2],
          });
        }
      });
    });
  }
  const { symbol, email } = req.body
  const timeframe = '1d';
  const limit = 100;
  const historicalData = await fetchHistoricalData(symbol, timeframe, limit);
  const closingPrices = historicalData.map(data => parseFloat(data));

  const { fastMACD, slowMACD, signalLine } = await calculateMACD(closingPrices);

  console.log(`MACD for ${symbol}`);
  console.log('Fast MACD Line:', fastMACD);
  console.log('Slow MACD Line:', slowMACD);
  console.log('Signal Line:', signalLine);
  if (signalLine) {
    verifyMail(email, symbol, req.hostname, req.protocol)
  } else {
    notifier.notify({
      title: 'Trade Pair not correct',
      message: 'Provide a correct trade pair',
      sound: true,
      wait: true
    },)
    console.log(dataFirst, dataSecond)
  }
  res.redirect('/')

});

router.get('/verify/:email/:first/:second', async (req, res) => {
  const first = req.params.first
  const second = req.params.second
  const email = req.params.email
  const crypto = new Crypto({
    symbol: first + "/" + second,
    email,

  })
  let saveCrypto = await crypto.save()
  res.redirect('/')
});

router.get('/delete/:email/:first/:second', async (req, res) => {
  const first = req.params.first
  const second = req.params.second
  const symbol=first+"/"+second
  const email = req.params.email
  const deleteCrypto = await Crypto.findOneAndDelete({ symbol, email })
  res.redirect('/')
});

module.exports = router
