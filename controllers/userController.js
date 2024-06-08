require('dotenv').config;
const {User,AditionalInfo} = require('../models/userModel');
const Bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const views = '../views/'
const Logguer = require('../logger/logger');
const s3Upload = require('./filesManage')


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
     
    res.render('completedRegisterForm',{user:req.user,validatedAcount:req.validatedAcount,formData,alert:false,userRegister:userRegister.user})
};

module.exports.finishRegister = async (req,res) => {
    let user = await User.findOne(req.user.user);
    let file = req.files.document_file;

    //Logguer.log(user._id)
    file.mv('/tmp/'+Date.now().toString()+'_'+file.name, async err =>{
        if(err) return res.status(500).send({ message : err });
        const upload = await s3Upload(file.data,Date.now().toString()+'_'+file.name);
        let data = req.body;
        data.document_file = upload;
        data.userId = user._id;
        let saveData = await AditionalInfo.createOne(data);
        Logguer.log(saveData)
        return res.render('test',{layout:false,img:upload});
    });

};

module.exports.changePassword = async (req,res) => {
    res.render('changePassword',{user:req.user,validatedAcount:req.validatedAcount,alert:false })
}

module.exports.logOut = (req,res) =>{
    req.session.destroy();
    res.status(200).clearCookie('authToken').redirect('/');
};
