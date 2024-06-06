const User = require('../models/userModel');

module.exports.isRegister = async (req,res,next) => {
    const user = await User.findOne(req.user.user);
    if(!user.validatedAcount){
        next()
    }else{
        return res.status(401).render('home',{
            alert:true,
            alertTitle: '!!!Espere!!!',
            alertMessage: 'Usted ya tiene una cuenta valida! no es necesaria esta accion',
            alertIcon: 'warning',
            showConfirmButton: true,
            ruta: '/home',
            validatedAcount:req.validatedAcount,
            user:req.user
        });
    }
};

module.exports.provider = async (req,res,next) => {
    let user = await User.findOne(req.user.user);
    switch (user.provider){
        case 'local':
            next();
        break;
        case 'google':
            res.status(401).render('home',{
                alert:true,
                alertTitle: '!!!Espere!!!',
                alertMessage: 'Usted inicio sesion con google! no es valida esta accion',
                alertIcon: 'warning',
                showConfirmButton: true,
                ruta: '/home',
                validatedAcount:req.validatedAcount,
                user:req.user
            });
        break;
        default:
            res.status(401).render('home',{
                alert:true,
                alertTitle: '!!!Ups ha ocurrido un error!!!',
                alertMessage: 'Usted no tiene acceso a esta accion!!!',
                alertIcon: 'error',
                showConfirmButton: true,
                ruta: '/home',
                validatedAcount:req.validatedAcount,
                user:req.user
            });
        break;
    }
}