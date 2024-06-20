
const Bcrypt = require('bcryptjs');
const {UserApp} = require('../../models/models');

module.exports.auth = async (req,res) =>{
    console.log(req.body)
    const data = req.body
    if(data.usuario == '' || data.password == '' ){
        res.status(401).json({status:false,message:"Debe ingresar el usuario y la clave"});
    }else{
        let user = await UserApp.findOne(data.usuario);
        console.log(user)
        if (user){
            console.log(data.password)
            let pass = Bcrypt.compareSync(data.password,user.password);
            
            if (pass){
                res.status(200).json({status:true,message:"Autenticacion exitosa"});;
            }else{
                res.status(401).json({status:false,message:"Error en la clave"}); 
            }
        }else{
            res.status(401).json({status:false,message:"Ususario no existe"});
        }
    }

}