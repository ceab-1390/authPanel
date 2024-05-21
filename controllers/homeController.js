require('dotenv').config;
const views = '../views/'
const Logguer = require('../logger/logger');

module.exports.index = (req,res) =>{
    console.log(req.user)
    res.render(views + 'home',{title:'Home',user:req.user})
}