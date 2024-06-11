require('dotenv').config;
const {User,AditionalInfo} = require('../models/userModel');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const views = '../views/'
const Logguer = require('../logger/logger');
const {s3Upload,manageFile} = require('./filesManage');
const fs = require('fs');
const {formidable} = require('formidable');


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
            allowEmptyFile: false
        };
        const form = formidable(options);
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
            const validateDocument = await AditionalInfo.validate(data.document);
            if (!validateDocument){
                const filesManage = await manageFile(files.document_file[0]);
                const upload = await s3Upload(filesManage.fileStream,filesManage.name);
                if (!upload){
                    return returnError('Ocurrio un error al intentar subir el archivo!!!');
                }else{
                    data.document_file = upload;
                    let saveData = await AditionalInfo.createOne(data);
                    if (saveData){
                        res.render('home',{
                            title:'Home',
                            user:req.user,
                            validatedAcount:req.validatedAcount,
                            alert:true,
                            alertTitle: '!!!Exito!!!',
                            alertMessage: 'Gracias por registrar sus datos',
                            alertIcon: 'success',
                            showConfirmButton: true,
                            ruta: '/home',
                
                        });
                    }else{
                        returnError('Ocurrio un error al guardar sus datos, compruebe su documento de identidad u otrta informacion, si su documento ya esta registrado en otra cuenta no prodra realizar esta accion')
                    }
                    }
            }else{
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
        }



        // const validateDocument = await AditionalInfo.validate(data.document);
        // if (!validateDocument){
        //     const filesManage = await manageFile(files.document_file[0]);
        //     const upload = await s3Upload(filesManage.fileStream,filesManage.name);
        //     Logguer.log(upload)
        // }else{
        //     returnError('El documento de identidad ya se encuentra registrado!!!') 
        // }

    /*let datos = await req[0]
    Logguer.log(datos)
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
    const validateDocument = await AditionalInfo.validate(req.body.document);
    /*if (!validateDocument){
        try {
            const file = await manageFile(req);
            const upload = await s3Upload(file.fileStream,file.name);
            console.log(upload);
            if (!upload){
                return returnError('Ocurrio un error al intentar subir el archivo!!!');
            }else{
                let data = {}
                Logguer.log(file.fields)
                data.document = file.fields.document[0];
                data.phone = file.fields.phone[0];
                data.document_file = upload;
                data.userId = user._id;
                let saveData = await AditionalInfo.createOne(data);
                if (saveData){
                    res.render('home',{
                        title:'Home',
                        user:req.user,
                        validatedAcount:req.validatedAcount,
                        alert:true,
                        alertTitle: '!!!Exito!!!',
                        alertMessage: 'Gracias por registrar sus datos',
                        alertIcon: 'success',
                        showConfirmButton: true,
                        ruta: '/home',
            
                    });
                }else{
                    returnError('Ocurrio un error al guardar sus datos, compruebe su documento de identidad u otrta informacion, si su documento ya esta registrado en otra cuenta no prodra realizar esta accion')
                }
            }
        } catch (error) {
            Logguer.error(error);
            return returnError('No fue posible procesar el archivo!!!');
        }
    }else{
        returnError('El documento de identidad ya se encuentra registrado!!!')
    }*/

    /*const validateDocument = await AditionalInfo.validate(req.body.document);
    if (!validateDocument){
        const file = await manageFile(req).then(async (sta) =>{
            data.document_file = sta;
            data.userId = user._id;
            let saveData = await AditionalInfo.createOne(data);
            if (saveData){
                res.render('home',{
                    title:'Home',
                    user:req.user,
                    validatedAcount:req.validatedAcount,
                    alert:true,
                    alertTitle: '!!!Exito!!!',
                    alertMessage: 'Gracias por registrar sus datos',
                    alertIcon: 'success',
                    showConfirmButton: true,
                    ruta: '/home',
        
                });
            }else{
                returnError('Ocurrio un error al guardar sus datos, compruebe su documento de identidad u otrta informacion, si su documento ya esta registrado en otra cuenta no prodra realizar esta accion')
            }
        }).catch(err =>{
            Logguer.log('Luego aqui')
            Logguer.error(err);
            return returnError('No fue posible procesar el archivo!!!')
        })
    }else{
        returnError('El documento de identidad ya se encuentra registrado!!!')
    };*/
  
    
    /*let file = req.files.document_file;
    if (file.size * 10 * 1024){
        Logguer.log('archivo muy grande')
    }
    let pathFileTmp = '/tmp/'+Date.now().toString()+'_'+file.name
    console.log(file)*/

    /*function returnError(error){
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
    file.mv(pathFileTmp, async err =>{
        if(err) return res.status(500).send({ message : err });
        const validateDocument = await AditionalInfo.validate(req.body.document)
        if (!validateDocument){
            const upload = await s3Upload(file.data,Date.now().toString()+'_'+file.name);
            if (!upload){
                returnError('No fue posible procesar el archivo!!!')
                return
            }else{
                fs.unlink(pathFileTmp, (err) => {
                    if (err){
                      return Logguer.log(err);
                    }
                        Logguer.info('Se borro el archivo temporal '+ pathFileTmp)
                })
            }
            let data = req.body;
            data.document_file = upload;
            data.userId = user._id;
            let saveData = await AditionalInfo.createOne(data);
            if (saveData){
                res.render('home',{
                    title:'Home',
                    user:req.user,
                    validatedAcount:req.validatedAcount,
                    alert:true,
                    alertTitle: '!!!Exito!!!',
                    alertMessage: 'Gracias por registrar sus datos',
                    alertIcon: 'success',
                    showConfirmButton: true,
                    ruta: '/home',
        
                });
            }else{
                returnError('Ocurrio un error al guardar sus datos, compruebe su documento de identidad u otrta informacion, si su documento ya esta registrado en otra cuenta no prodra realizar esta accion')
            }
        }else{
            returnError('El documento de identidad ya se encuentra registrado!!!')
        };
    });*/
};

module.exports.payIndex = async (req,res) => {
    const userRegister = await User.findOne(req.user.user);
    res.render('completedPayForm',{user:req.user,validatedAcount:req.validatedAcount,formData,alert:false,userRegister:userRegister.user});
};

module.exports.payConfirm = async (req,res) => {
    const userRegister = await User.findOne(req.user.user);
    Logguer.log(req.body)
    //res.render('completedPayForm',{user:req.user,validatedAcount:req.validatedAcount,formData,alert:false,userRegister:userRegister.user});
};

module.exports.changePassword = async (req,res) => {
    Logguer.log(req.body)
    res.render('changePassword',{user:req.user,validatedAcount:req.validatedAcount,alert:false })
};

module.exports.logOut = (req,res) =>{
    req.session.destroy();
    res.status(200).clearCookie('authToken').redirect('/');
};
