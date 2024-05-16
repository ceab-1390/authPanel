const User = require('../models/userModel');
const Bcrypt = require('bcryptjs')

async function runNewUser(){
    var pass = 'debian' 
    pass = Bcrypt.hashSync(pass, 10);
    console.log(pass)
    const validate = await User.validate('admin')
    if (!validate){
        const newUser = await User.createOne({
            user : 'admin',
            password : pass
        });
        console.log(newUser)
    }else{
        console.error(new Error('Ya existe el usuario admin'))
    }
}

runNewUser()