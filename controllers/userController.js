require('dotenv').config;
const User = require('../models/userModel');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const views = '../views/'
const Logguer = require('../logger/logger');


module.exports.index = async (req,res) =>{
    req.session.destroy();
    res.clearCookie('authToken').render(views + 'login',{alert: false, layout: false })
};

module.exports.logIn = async (req,res) => {
    
  //Logguer.debug(req)
    if (Object.keys(req.body).length === 0){
        if (req.user.provider === 'google'){
            const token = jwt.sign({id: req.user.id, user: req.user._json.email}, process.env.SECRET, { expiresIn: '1d' });
            res.status(200).cookie('authToken',token ).redirect('/home');
        }
    }else{
        if (req.body.user == '' && req.body.password == ''){
            res.render(views + 'login',{
                alert:true,
                alertTitle: 'Advertneccia',
                alertMessage: 'Debe ingresar los datos',
                alertIcon: 'error',
                showConfirmButton: true,
                ruta: '',
                layout: false
            });
    }else{
            const userLogin = await User.findOne(req.body.user).then((U) =>{
            if (!U){
                res.render(views + 'login',{
                    alert:true,
                    alertTitle: 'Advertneccia',
                    alertMessage: 'Usuario no valido',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    ruta: '',
                    layout: false
                })
                req.session.destroy();

                //res.json({success: false, error: 'No exioste el usuario'}).redirect('/');
            }else{
                const compare = Bcrypt.compareSync(req.body.password , U.password)
                if (!compare){
                    res.render(views + 'login',{
                        alert:true,
                        alertTitle: 'Advertneccia',
                        alertMessage: 'Clave erronea',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        ruta: '',
                        layout: false
                    })
                }else{
                    const token = jwt.sign({id: U._id, user: U.user}, process.env.SECRET, { expiresIn: '1d' });
                    res.status(200).cookie('authToken',token ).redirect('/home');
                }
            }
        }).catch(err => {
            Logguer.error(err);
            req.session.destroy();

        })
        }
    }

    
};

module.exports.register = async (req,res) => {
    res.render('register',{layout:false})
}

module.exports.registerOne = async (req,res) => {
    console.log(req.body)
    let password = req.body.password;
    if(password[0] != password[1]){
        res.send('password not math')
    }
}


module.exports.logOut = (req,res) =>{
    req.session.destroy();
    res.status(200).clearCookie('authToken').redirect('/');
};
