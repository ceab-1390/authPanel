require('dotenv').config;
const express = require('express');
const app = express()
const session = require('express-session');
const bodyParser = require('body-parser');
const routes = require('./routes')
const cookieParser = require('cookie-parser');
const expressLayouts = require('express-ejs-layouts');


const port = process.env.PORT;

console.log('views', __dirname + '/views/')
app.use(bodyParser.json());
app.use(cookieParser());
app.use(expressLayouts)
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/public', express.static(__dirname + '/public'));
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'));
app.use('/icons', express.static(__dirname + '/node_modules/bootstrap-icons/font'));
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist'));
app.use('/js', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'));
app.use('/js', express.static(__dirname + '/node_modules/sweetalert2/dist'));
app.use(routes);


app.listen(port, ()=>{
    console.log('App is running')
})
