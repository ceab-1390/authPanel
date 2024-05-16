const { mongo, default: mongoose } = require('mongoose');
const { use } = require('../routes');
require('./db');

const UserSchema = new mongoose.Schema({
    user: {
       type: String,
       unique: true,
       required: true,
       lowercase: true,
       trim: true 
    },
    password: {
        type: String,
        required: true
    }
},{
    timestamps: true
},{
    collection: "users"
} )

const UserModel = new mongoose.model("User", UserSchema);

class User {
    static async getAll(){
        try {
            const users = await UserModel.find();
            return users;
        } catch (error) {
            console.error(new Error('Error al buscar la informacion en la base de datos: '+error))
        }
    }

    static async createOne(data){
        try {
            const newUser = await UserModel(data)
            newUser.save()
            return newUser
        } catch (error) {
            console.error(new Error('Error al guardar la informacion en la base de datos: '+error))
        }
    }
    static async validate(U){
        try {
            const user = await UserModel.findOne({user: U});
            if (user){
                return true;
            }
            return false;
        } catch (error) {
            console.error(new Error('Error al buscar la informacion en la base de datos: '+error))
        }
    }


    static async findOne(U){
        try {
            const user = await UserModel.findOne({user: U});
            return user
        } catch (error) {
            console.error(new Error('Error al buscar la informacion en la base de datos: '+error))
        }
    }
}

module.exports = User