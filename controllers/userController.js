require('dotenv').config();
const {User,AditionalInfo,Tokens} = require('../models/userModel');
const {Pay,InfoPay} = require('../models/models');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const views = '../views/'
const Logguer = require('../logger/logger');
const {s3Upload,manageFile} = require('./filesManage');
//const fs = require('fs');
const {formidable} = require('formidable');
const sendMail = require('./mailController');
const {clients} = require('./wsController');
const {v4: uuidv4} = require('uuid');

let formData = {
    name: '',
    lastname: '',
    user: '',
    data: false
}

module.exports.index = async (req,res) =>{
    req.session.destroy();
    res.clearCookie('authToken').render(views + 'login',{alert: false, layout: false })
};

module.exports.logIn = async (req,res) => {
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
    res.render('register',{layout:false,alert:false,formData})
    req.session.formData = {
        name: '',
        lastname: '',
        user: '',
        data: false
    }
}

module.exports.registerOne = async (req,res) => {
    req.session.formData = {};
    let password = req.body.password;
    if(password[0] != password[1]){
        req.session.formData = req.body
        formData = req.session.formData
        formData.data = true;
        res.render('register',{
            layout:false,
            alert:true,
            alertTitle: 'Advertneccia',
            alertMessage: 'Las contrasenas no coinciden',
            alertIcon: 'error',
            showConfirmButton: true,
            ruta: 'register',
            layout: false,
            formData
        });
    }else{
        let data = req.body
        data.password = data.password[0];
        data.password = Bcrypt.hashSync(data.password, 10);
        let validateUser =await User.validate(data.user);
        if(validateUser){
            req.session.formData = req.body
            formData = req.session.formData
            formData.data = true;
            res.render('register',{
                layout:false,
                alert:true,
                alertTitle: 'Advertneccia',
                alertMessage: 'El usuario ya existe en los registros',
                alertIcon: 'error',
                showConfirmButton: true,
                ruta: 'register',
                layout: false,
                formData
            });
        }else{
            let saveUser = await User.createOne(data);
            req.session.formData = {};
            res.render('login',{
                layout:false,
                alert:true,
                alertTitle: 'Advertneccia',
                alertMessage: 'Registro exitoso',
                alertIcon: 'success',
                showConfirmButton: true,
                ruta: '',
                layout: false,
            }); 
        }
        
    }
};

module.exports.completedRegister = async (req,res) => {
    const userRegister = await User.findOne(req.user.user);
    res.cookie('wsId',userRegister.user);
    res.render('completedRegisterForm',{user:req.user,validatedAcount:req.validatedAcount,formData,alert:false,userRegister:userRegister.user});
};

module.exports.finishRegister = async (req,res) => {
        let user = await User.findOne(req.user.user);
        function returnError(error){
            res.render('home',{
                title:'Home',
                user:req.user,
                validatedAcount:req.validatedAcount,
                alert:true,
                alertTitle: '!!!Error!!!',
                alertMessage: error,
                alertIcon: 'error',
                showConfirmButton: true,
                ruta: '/home',
    
            });
        }
        let options = {
            maxFileSize: 10 * 1024 * 1024,
            allowEmptyFile: false,
            /*filter: function(name, file) {
                const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.gif'];
                console.log('filter')
                return allowedExtensions.includes(extension);
            }*/
        };
        const form = formidable(options);
        form.on('progress',(recived,expected)=>{
            let id = user.user;
            clients[id].send((recived / expected) * 100 );
            Logguer.log((recived / expected) * 100 )
        });
        form.on('end',()=>{
            let id = user.user;
            clients[id].send('finish');
            Logguer.debug('Carga finalizada')
        })
        try {
            const result = await new Promise((resolve,reject) => {
                form.parse(req,async (err, fields, files) => {
                    if (err){
                        reject(err)
                    }else{
                        resolve({fields,files});
                    };
                });
            })
            let {fields,files} = result;
            let data = {};
            data.document = fields.document[0];
            data.phone = fields.phone[0];
            data.email = fields.email[0];
            data.userId = user._id;
            data.tokenMail = await jwt.sign({id: data.userId, mail: data.email}, process.env.SECRET, { expiresIn: '5d' });
            Logguer.debug(data.tokenMail)
            const validateDocument = await AditionalInfo.validate(data.document);
            if (!validateDocument){
                const filesManage = await manageFile(files.document_file[0]);
                const upload = await s3Upload(filesManage.fileStream,filesManage.name,filesManage.path);
                if (!upload){
                    return returnError('Ocurrio un error al intentar subir el archivo!!!');
                }else{
                    data.document_file = upload;
                    let mailData = {}
                    mailData.to = data.email;
                    mailData.tokenMail = data.tokenMail
                    sendMail.sendMailVerification(mailData);
                    let saveData = await AditionalInfo.createOne(data);
                    if (saveData){
                        res.render('home',{
                            title:'Home',
                            user:req.user,
                            validatedAcount:req.validatedAcount,
                            alert:true,
                            alertTitle: '!!!Exito!!!',
                            alertMessage: 'Enviaremos un correo a la direccion: '+data.email+ ' Por favor ingresa a la bandeja de entrada y verifica tu correo',
                            alertIcon: 'success',
                            showConfirmButton: true,
                            ruta: '/home',
                
                        });
                    }else{
                        returnError('Ocurrio un error al guardar sus datos, compruebe su documento de identidad u otrta informacion, si su documento ya esta registrado en otra cuenta no prodra realizar esta accion')
                    }
                    }
            }else{
                let mailData = {}
                mailData.to = data.email;
                mailData.tokenMail = data.tokenMail
                sendMail.sendMailVerification(mailData);
                returnError('El documento de identidad ya se encuentra registrado!!!') 
            }
        } catch (error) {
            const regex = /options\.maxTotalFileSize \(\d+ bytes\) exceeded, received (\d+) bytes of file data/;
            const match = error.message.match(regex);
            if (match){
                returnError('El archivo exede el volumen establecido = 10Mb, por favor ingrese un archivo menos pesado')
            }else{
                returnError('Ocurrio un error al subir sus datos')
            }
            Logguer.error(error)
        };


};

module.exports.payIndex = async (req,res) => {
    const userRegister = await User.findOne(req.user.user);
    res.render('completedPayForm',{user:req.user,validatedAcount:req.validatedAcount,alert:false,userRegister:userRegister.user});
};

module.exports.payConfirm = async (req,res) => {
    const userRegister = await User.findOne(req.user.user);
    let data = req.body;
    data.username = req.user.user;
    function returnError(error){
        res.render('completedPayForm',{
            title:'Home',
            user:req.user,
            validatedAcount:req.validatedAcount,
            alert:true,
            alertTitle: '!!!Error!!!',
            alertMessage: error,
            alertIcon: 'error',
            showConfirmButton: true,
            ruta: '/perfil/pay',
            userRegister:userRegister.user
        });
    }
    const validate = await Pay.validOne(data.reference,data.phone);
    if (!validate){
        const newPay = await Pay.createOne(data);
        const lastPay = await User.updatePay(req.user.user,newPay._id)
        if (!lastPay){
            Logguer.error('No se actuaalizo el pago para: '+req.user.user)
        }else{
            Logguer.debug('Pago actualizado para: '+req.user.user)
        }
        if (newPay){
            res.render('completedPayForm',{
                user:req.user,
                validatedAcount:req.validatedAcount,
                alert:true,
                alertTitle: '!!!Exito!!!',
                alertMessage: 'Gracias, su pago fue recibido, sera verificado por nuestro personal y le comunicaremos vie correo!',
                alertIcon: 'success',
                showConfirmButton: true,
                ruta: '/perfil/pay',
                userRegister:userRegister.user
            });
        }
    }else{
        returnError('Pago ya registrado, este pago no es valido!!!')
    }
};

module.exports.changePassword = async (req,res) => {
    Logguer.log(req.body)
    res.render('changePassword',{user:req.user,validatedAcount:req.validatedAcount,alert:false })
};

module.exports.logOut = (req,res) =>{
    req.session.destroy();
    res.status(200).clearCookie('authToken').redirect('/');
};

module.exports.validateMail = async (req,res) =>{
    const mailToken = req.params.tokenMail
    const decoded = jwt.verify(mailToken, process.env.SECRET);
    const user = await User.findOne(decoded.mail);
    const validToken = await Tokens.validate(mailToken);
    if (!validToken){
        if(!user.validMail){
            const validMail = await User.verifiedMail(decoded.id);
            if (validMail){
                let data = {};
                data.token = mailToken;
                data.userId = decoded.id;
                const usedToken = await Tokens.createOne(data);
                if(usedToken){
                    Logguer.debug('Token guardado: '+usedToken);
                }else{
                    Logguer.error('Error al guardar el token');
                }
                res.render('mailValid',{layout:false})
            }else{
                Logguer.error('No se logro actualizar el estado del email')
            }
        }else(
            res.redirect('/home')
        )
    }else{
        res.status(401).json({info:"El token que intenta usar ya fue utilizado o expiro!!!", login: process.env.URL})
    }   
}
