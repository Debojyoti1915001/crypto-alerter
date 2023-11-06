const express = require('express')
const path = require('path')

const mongoose = require('mongoose')
const connect_flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')

const axios = require('axios')
const Crypto = require('./models/Crypto')
const { alertMail,alertDownMail } = require('./config/nodemailer');


const technicalindicators = require('technicalindicators');
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

async function alerter() {
    const db = await Crypto.find({});
    console.log(db)
    for (var i of db) {
        const symbol=i.symbol
        const interval = 'daily'; // Set the interval ('daily', 'weekly', 'monthly', etc.)
        const dataPoints = 100;
        const apiUrl = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&interval=${interval}&days=100`;
        var fast, slow,macd;
      try {
        const response = await axios.get(apiUrl);
        const historicalData = response.data.prices;
        const closePrices = historicalData.map(dataPoint => dataPoint[1]);
    
        // Calculate fast-paced EMA (12-period)
        const fastEMA = new technicalindicators.EMA({ period: 12, values: closePrices });
    
        // Calculate slow-paced EMA (26-period)
        const slowEMA = new technicalindicators.EMA({ period: 26, values: closePrices });
    
        // Calculate MACD for the cryptocurrency symbol
        const macdInput = {
          values: closePrices,
          fastPeriod: 12,
          slowPeriod: 26,
          signalPeriod: 9,
          SimpleMAOscillator: false,
          SimpleMASignal: false,
        };
        const macd = new technicalindicators.MACD(macdInput);
        const macdResult = macd.getResult();
    
        console.log(`Symbol: ${symbol}`);
        console.log("Close Prices:", closePrices);
        console.log("Fast EMA:", fastEMA.getResult());
        fast=fastEMA.getResult()
        console.log("Slow EMA:", slowEMA.getResult());
        slow=slowEMA.getResult()
        console.log("MACD:", macdResult.map(res => res.MACD));
        macd=macdResult.map(res => res.MACD)
      } catch (error) {
        console.error(`Error fetching data for ${symbol}: ${error}`);
      }
      var down=0;
      for(var j=1;j<100;j++){
        if(macd[j]<macd[j-1])down++
        if(down>70){
            alertDownMail(i.email, symbol)
        }
      }

      for(var j=0;j<100;j++){
        if (fast[j] < slow[j]) {
            alertMail(i.email, symbol, fast[j] , slow[j], process.env.hostname, process.env.protocol)
            // console.log(i.email,first,second, req.hostname, req.protocol)
            console.log("Yes")
            break;
        } 
      }
    //   console.log("No")
    }

}
// setInterval(alerter,   1000);
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



