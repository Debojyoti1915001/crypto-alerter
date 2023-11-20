const express = require('express')
const path = require('path')

const mongoose = require('mongoose')
const connect_flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')

const axios = require('axios')
const Crypto = require('./models/Crypto')
const { alertMail, alertDownMail,alertUpMail } = require('./config/nodemailer');

const ccxt = require('ccxt');

const tulind = require('tulind');
//Configuring App
const app = express()
app.use(express.json())
// app.use(express.static('public'))
app.use(cookieParser())
// using dotenv module for environment
require('dotenv').config()

//Configuring Port
const PORT = process.env.PORT || 3000

//Mongoose connection
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => console.log('Connected to mongo server'))
  .catch((err) => console.error(err))



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




async function alerter() {
  const db = await Crypto.find({});
  console.log(db)
  // const symbols = ['BTC/USDT', 'ETH/USDT', 'XRP/USDT'];
  const timeframe = '1d';
  const limit = 100; // Number of historical data points to fetch
  for (var i of db) {
    const historicalData = await fetchHistoricalData(i.symbol, timeframe, limit);
    const closingPrices = historicalData.map(data => parseFloat(data));

    const { fastMACD, slowMACD, signalLine } = await calculateMACD(closingPrices);

    console.log(`MACD for ${i.symbol}`);
    console.log('Fast MACD Line:', fastMACD);
    console.log('Slow MACD Line:', slowMACD);
    console.log('Signal Line:', signalLine);
    console.log('-----------------------------');
    const fast = fastMACD
    const slow = slowMACD
    
    // for (var j = 1; j < slow.length; j++) {
      // console.log(fast[j-1]," ",fast[j])
      if (fast[fast.length-2] > fast[fast.length-1]) {
        // console.log("1 ",j);
        alertDownMail(i.email, i.symbol)
        // console.log(i.email,first,second, req.hostname, req.protocol)
        console.log("Yes")
        break;
      }
    // }
     
    // for (var j = 0; j < slow.length; j++) {
      if (slow[slow.length-1] < fast[fast.length-1]) {
        // console.log("2 ",j);
        alertMail(i.email, i.symbol, fast[j], slow[j], process.env.hostname, process.env.protocol)
        // console.log(i.email,first,second, req.hostname, req.protocol)
        console.log("Yes")
        // break;
      }
    // }
      console.log("No")
    }
}
setInterval(alerter, 24*60*60* 1000);
app.use(connect_flash())


const publicDirectory = path.join(__dirname, '../public')
// console.log(publicDirectory);
app.use(express.static(publicDirectory))

//Setting EJS view engine
app.set('views', path.join(__dirname, '../views'));

app.set('view engine', 'ejs')

//app.use(expressLayouts);
//body parser
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: true,
    saveUninitialized: true,
  })
)


// global var
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg')
  res.locals.error_msg = req.flash('error_msg')

  next()
})

//Setup for rendering static pages


//Routes
const indexRoutes = require('./routes/index')
app.use('/', indexRoutes)
//Start the server
app.listen(PORT, () => {
  console.log('Server listening on port', PORT)
})




//  const User= require('./models/Crypto')
// const databasedlt= async()=>{
//    const user = await User.find({})
//    user.forEach(async(data)=>{
//         await User.findByIdAndDelete(data._id)
//    })
//    console.log("deleted")
// }
// databasedlt()



//  const Relations= require('./models/Hospital')
// const databasedlt= async()=>{
//    const user = await Relations.find({_id: "60259290d60e72021ba9ed4a"})
//    user.forEach(async(data)=>{
//         await Relations.findByIdAndDelete(data._id)
//    })
//    console.log("deleted")
// }
// databasedlt()
