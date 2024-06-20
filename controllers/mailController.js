require('dotenv').config();
const mail = require('nodemailer');
const Logguer = require('../logger/logger');


const transporter = mail.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_ACCOUNT,
      pass: process.env.MAIL_APP_PASS
    }
});


module.exports.sendMailVerification =async (data) =>{
    Logguer.log(data)
    const mailOptions = {
        from: 'no-reply',
        to: data.to,
        subject: 'Bienvenido a Sitios, por favor verifique su correo',
        text: 'En el siguiente en lace podra verificar su correo: http://directorios.solutecvzla.com/perfil/validateMail/'+data.tokenMail
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        Logguer.debug(info);
        return true;
    } catch (error) {
        Logguer.error(error);
        return false
    }

}

module.exports.sendMailActivate =async (data) =>{
    const mailOptions = {
        from: 'no-reply',
        to: data.correo,
        subject: 'Bienvenido a Sitios, estas seran sus credenciales para ingresar mediante la app android',
        text: 'Por favor guarde sus credenciales en un lugar seguro:\n\n Usuario: '+data.correo+' \n\nPassword: '+data.passwordPlain
    };
    try {
        let info = await transporter.sendMail(mailOptions);
        Logguer.debug(info)
        return true;
    } catch (error) {
        Logguer.error(error);
        return false
    }

}