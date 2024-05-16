require('dotenv').config;
const views = '../views/'

module.exports.index = (req,res) =>{
    res.render(views + 'home',{title:'Home',user:req.user.user})
}