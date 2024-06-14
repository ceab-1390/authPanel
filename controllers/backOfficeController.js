require('dotenv').config();
const {User,AditionalInfo,Tokens} = require('../models/userModel');
const {Pay} = require('../models/models');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Logguer = require('../logger/logger');


module.exports.login = (req,res) =>{
    res.render('backoffice/login',{layout:false,alert:false});
}

module.exports.auth = async (req,res) =>{
    if (Object.keys(req.body).length === 0){
        if (req.user.provider === 'google'){
            Logguer.log(req.user._json.email)
            const userLogin = await User.findOne(req.user._json.email).then((U)=>{
                Logguer.debug(U)
                if(U == null){
                    res.redirect('/');
                }
                const token = jwt.sign({id: U._id, user: U.user}, process.env.SECRET, { expiresIn: '1d' });
                res.status(200).cookie('authToken',token ).redirect('/home');
            })
        }
    }else{
        if (req.body.user == '' && req.body.password == ''){
            res.render('backoffice/login',{
                alert:true,
                alertTitle: 'Advertneccia',
                alertMessage: 'Debe ingresar los datos',
                alertIcon: 'error',
                showConfirmButton: true,
                ruta: 'backOffice',
                layout: false
            });
    }else{
            const userLogin = await User.findOne(req.body.user).then((U) =>{
            if (!U){
                res.render('backoffice/login',{
                    alert:true,
                    alertTitle: 'Advertneccia',
                    alertMessage: 'Usuario no valido',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    ruta: 'backOffice',
                    layout: false
                })
                req.session.destroy();

                //res.json({success: false, error: 'No exioste el usuario'}).redirect('/');
            }else{
                const compare = Bcrypt.compareSync(req.body.password , U.password)
                if (!compare){
                    res.render('backoffice/login',{
                        alert:true,
                        alertTitle: 'Advertneccia',
                        alertMessage: 'Clave erronea',
                        alertIcon: 'error',
                        showConfirmButton: true,
                        ruta: 'backOffice',
                        layout: false
                    })
                }else{
                    const token = jwt.sign({id: U._id, user: U.user}, process.env.SECRET, { expiresIn: '1d' });
                    res.status(200).cookie('authToken',token ).redirect('/backoffice/home');
                }
            }
        }).catch(err => {
            Logguer.error(err);
            req.session.destroy();

        })
        }
    }
}

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
    Logguer.log(id)
    const activate = await User.activateOne(id);
    if (activate){
        res.status(200).json({status:true});
        Logguer.debug('Se activo la cuenta: '+id)
    }else{
        res.status(200).json({status:false});
        Logguer.info('No se activo la cuenta por algun error')
    }
}

/*module.exports.showDocument = async (req,res) => {
    let img = req.params.img
    img = await User.findOne(img);
    img.info ? img = img.info.document_file :  img = '/public/img/User.png';
    res.render('backoffice/blank',{layout:'backoffice/backOfficeLayout',alert:false, img})
}*/
