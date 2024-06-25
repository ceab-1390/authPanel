require('dotenv').config();
const { User } = require('../models/userModel');
const Logguer = require('../logger/logger');

module.exports.index = async (req,res) =>{
    const data = await User.findOne(req.user.user);
    Logguer.log(data)
    res.render('profile',{user:req.user,validatedAcount:req.validatedAcount,alert:false,data})
}