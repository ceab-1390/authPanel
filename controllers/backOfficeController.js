require('dotenv').config();
const {User,AditionalInfo,Tokens} = require('../models/userModel');
const {Pay,UserApp,UserBackoffice} = require('../models/models');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Logguer = require('../logger/logger');
const sendMail = require('./mailController');

module.exports.login = (req,res) =>{
    req.session.destroy();
    res.clearCookie('backOffice').render('backoffice/login',{layout:false,alert:false});
}

module.exports.auth = async (req,res) =>{
    function returError(message){
        res.render('backoffice/login',{
            alert:true,
            alertTitle: 'Advertneccia',
            alertMessage:   message,
            alertIcon: 'error',
            showConfirmButton: true,
            ruta: 'backOffice',
            layout: false
        });
    }
    if (req.body.user == '' && req.body.password == ''){
        returError('Debe ingresar el usuario y la clave');
    }else{
        const userLogin = await UserBackoffice.findOneUser(req.body.user).then((U) =>{
            if (!U){
                returError('Usuario no valido!!')
                req.session.destroy()   
            }else{
                const compare = Bcrypt.compareSync(req.body.password , U.password)
                if (!compare){
                    returError('Clave erronea');
                }else{
                    const token = jwt.sign({id: U._id, user: U.user}, process.env.SECRETBO, { expiresIn: '1d' });
                    res.status(200).cookie('backOffice',token ).redirect('/backoffice/home');
                }
            }
        }).catch(err => {
                Logguer.error(err);
                req.session.destroy();

        })
    }
};

module.exports.index = async (req,res) =>{
    res.render('backoffice/home',{layout:'backoffice/backOfficeLayout',alert:false})
};

module.exports.clientsFree = async (req,res) => {
    let page = req.params.page;
    let limit = 10; 
    if (Number(page) <= 0 ){
        page = 1
    }
    const clients = await User.getAll(page,limit);
    if (clients.length == 0){
        res.render('backoffice/clientes',{
            layout:'backoffice/backOfficeLayout',
            alert:true,
            alertIcon: 'warning',
            alertTitle: '!!!Ups!!!',
            alertMessage: 'No hay mas paginas que mostrar',
            ruta: '1',
            clients:clients,
            totalPages:clients.totalPages,
            page
        });
        return
    }else{
        res.render('backoffice/clientes',{layout:'backoffice/backOfficeLayout',alert:false,clients:clients,totalPages:clients.totalPages,page});
    }
    
};

module.exports.activateClient = async (req,res) =>{
    let id = req.body.client;
    Logguer.debug(id)
    const user = await User.findOneId(id);
    const activate = await User.activateOne(id);
    if (activate){
        let data = {};
        data.correo = user.user;
        data.nombre = user.name +' '+user.lastname ? user.lastname : '';
        data.numero = user.info ? user.info.phone : '';
        data.passwordPlain = Math.random().toString(36).substring(2, 10);
        data.password = Bcrypt.hashSync(data.passwordPlain,10);
        const userApp = await UserApp.createOne(data)
        if(userApp){
            sendMail.sendMailActivate(data);
            res.status(200).json({status:true});
            Logguer.debug('Se activo la cuenta: '+id);
        }else{
            res.status(200).json({status:false});
            Logguer.info('No se activo la cuenta por algun error 1')
        }
    }else{
        res.status(200).json({status:false});
        Logguer.info('No se activo la cuenta por algun error 2')
    }
};

module.exports.logOut = (req,res) =>{
    req.session.destroy();
    res.status(200).clearCookie('backOffice').redirect('/backoffice');
};

/*module.exports.showDocument = async (req,res) => {
    let img = req.params.img
    img = await User.findOne(img);
    img.info ? img = img.info.document_file :  img = '/public/img/User.png';
    res.render('backoffice/blank',{layout:'backoffice/backOfficeLayout',alert:false, img})
}*/
