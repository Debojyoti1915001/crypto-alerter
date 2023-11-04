const express = require('express')
const path = require('path')

const mongoose = require('mongoose')
const connect_flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const expressLayouts = require('express-ejs-layouts')

const axios = require('axios')
const Crypto=require('./models/Crypto')
const { alertMail } = require('./config/nodemailer');


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
    const db=await Crypto.find({});
    console.log(db)
    for(var i of db){
        const first = await axios.get(`https://api.kraken.com/0/public/OHLC?pair=${i.first}`);
        const second = await axios.get(`https://api.kraken.com/0/public/OHLC?pair=${i.second}`);
        
        const val1=Number(first.data.result.last)+1
        const val2=Number(second.data.result.last)
        if(val1>val2){
            var keyFirst,keySecond; 
              
            for (var k in first.data.result) { 
                keyFirst = k; 
                break; 
            } 
            for (var k in second.data.result) { 
                keySecond = k; 
                break; 
            } 
            alertMail(i.email,first,keyFirst,second,keySecond, process.env.hostname, process.env.protocol)
            // console.log(i.email,first,second, req.hostname, req.protocol)
        }else
        {console.log("No")}
    }
    
}
setInterval(alerter,60* 60*1000);
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




//  const User= require('./models/Relations')
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



