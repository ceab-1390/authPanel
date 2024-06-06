require('dotenv').config()
const jwt = require('jsonwebtoken');
const User = require('../models/userModel')



module.exports.loguedIn = async (req,res,next) => {
    const token = req.cookies.authToken;
    if (!token) {
        return res.status(401).render('login',{
                    alert:true,
                    alertTitle: 'Advertneccia',
                    alertMessage: 'No autorizado, por favor inicie sesion',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    ruta: '',
                    layout: false
        });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        const validUser = await User.findOne(decoded.user);
        if (validUser.id === decoded.id){
            req.user = {}//validUser.user;
            req.user.user = validUser.user;
            req.user.name = validUser.name;
            req.user.lastname = validUser.lastname;
            req.validatedAcount = validUser.validatedAcount;
            req.superUser = validUser.superUser;
            next();
        }else{
            return res.status(401).redirect('/')
        }
        /*switch(validUser.provider){
            case 'local':
                if (validUser.id === decoded.id){
                    req.user = validUser.user;
                    req.validatedAcount = validUser.validatedAcount;
                    req.superUser = validUser.superUser;
                    next();
                }else{
                    return res.status(401).redirect('/')
                }
            break;
            case 'google':
                if (validUser){
                    req.user = validUser.user;
                    req.validatedAcount = validUser.validatedAcount;
                    req.superUser = validUser.superUser;
                    next();
                }else{
                    return res.status(401).redirect('/')
                }
            break;
        }*/
      
     
    } catch (error) {
        //res.status(403).json({ success: false, error: 'Token inválido' });
        return res.status(403).redirect('/')
    }

}