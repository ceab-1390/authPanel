require('dotenv').config;
const User = require('../models/userModel');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const views = '../views/'

module.exports.index = async (req,res) =>{
    res.clearCookie('authToken').render(views + 'login',{alert: false, layout: false })
}

module.exports.logIn = async (req,res) => {
    //console.log(req.body)
    if (req.body.user == '' && req.body.password == ''){
        res.render(views + 'login',{
            alert:true,
            alertTitle: 'Advertneccia',
            alertMessage: 'Debe ingresar los datos',
            alertIcon: 'error',
            showConfirmButton: true,
            ruta: '',
            layout: false
        })
    }else{

    const userLogin = User.findOne(req.body.user).then((U) =>{
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
                res.status(200).cookie('authToken',token ).redirect('/home')
            }
        }
    }).catch(err => {
        console.error(new Error('Ocurrio un error: '+err));
    })
    }
    
}


module.exports.logOut = (req,res) =>{
    //console.log(req.cookies.authToken)
    res.status(200).clearCookie('authToken').redirect('/');
}