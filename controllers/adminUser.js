require('dotenv').config()
const {UserBackoffice} = require('../models/models');
const Bcrypt = require('bcryptjs')
const Logguer = require('../logger/logger');

module.exports.runNewUser = async ()=>{
    let opc = process.env.CREATEADMIN
    if (opc){
        var pass = 'debian*123' 
        pass = Bcrypt.hashSync(pass, 10);
        const validate = await UserBackoffice.validate('admin')
        if (!validate){
            const newUser = await UserBackoffice.createOne({
                user : 'admin',
                password : pass,
                name: 'admin',
                lastname: 'of all',
                admin: 2,
                email: 'admin@email.local'
            });
            return newUser;
        }else{
            return 'Ya existe el usuario admin';
        }
    }
}



