const { mongo, default: mongoose,Schema } = require('mongoose');
require('./db');


const AditionalInfoSchema = new mongoose.Schema({
    document: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        trim: true
    },
    phone: {
        type: String,
        unique: false,
        required: true,
        lowercase: true,
        trim: true 
    },
    document_file:{
        type: String,
        unique: false,
        required: true,
        lowercase: false,
        trim: true
    },
},{
    timestamps: true
},{
    collection: "aditional_info_users"
});

const aditionalInfoModel = new mongoose.model("Aditional_info_users",AditionalInfoSchema);

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: false,
        required: true,
        lowercase: true,
        trim: true 
    },
    lastname: {
       type: String,
       unique: false,
       required: false,
       lowercase: true,
       trim: true 
    },
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
    },
    provider: {
        type: String,
        unique: false,
        required: true,
        lowercase: true,
        trim: true,
        default: 'local' 
    },
    superUser: {
        type: Boolean,
        unique: false,
        required: true,
        default: false 
    },
    /*validateStatus:{
        type: Number,
        unique: false,
        required: true,
        default: 1 
    },
    validatedAcount: {
        type: Boolean,
        unique: false,
        required: true,
        default: false 
    },*/
    validatedAcount: {
        type: Number,
        unique: false,
        required: true,
        default: 0 
    },
    info:{
        type: Schema.Types.ObjectId,
        required: false,
        ref: aditionalInfoModel,
    }
},{
    timestamps: true
},{
    collection: "users"
} );

const UserModel = new mongoose.model("User", UserSchema);

class User {
    static async getAll(){
        try {
            const users = await UserModel.find();
            return users;
        } catch (error) {
            console.error(new Error('Error al buscar la informacion en la base de datos: '+error))
        }
    };
    static async createOne(data){
        try {
            const newUser = await UserModel(data)
            newUser.save()
            return newUser
        } catch (error) {
            console.error(new Error('Error al guardar la informacion en la base de datos: '+error))
        }
    };
    static async validate(U){
        try {
            const user = await UserModel.findOne({user: U});
            if (user){
                return true;
            }
            return false;
        } catch (error) {
            console.error(new Error('Error al buscar la informacion en la base de datos: '+error))
            return false
        }
    };
    static async findOne(U){
        try {
            const user = await UserModel.findOne({user: U}).populate('info');;
            return user
        } catch (error) {
            console.error(new Error('Error al buscar la informacion en la base de datos: '+error))
        }
    };
    static async updateInfo(id,data){
        try {
            let update = await UserModel.updateOne(
                {_id:id},
                {
                  $set:{
                    info: data,
                    validatedAcount: 1
                  }  
                },
            )
        } catch (error) {
            console.error(error);
        }
    }
};

class AditionalInfo{
    static async validate(CI){
        try {
            const document = await aditionalInfoModel.findOne({document: CI});
            if (document){
                return true;
            }
            return false;
        } catch (error) {
            console.error(new Error('Error al buscar la informacion en la base de datos: '+error))
            return false
        }
    };
    static async createOne(data){
        try {
            const newData = await aditionalInfoModel(data)
            await newData.save()
            let dataInfo = {}
            dataInfo = newData._id
            const updateUser = await User.updateInfo(data.userId,dataInfo)
            return newData
        } catch (error) {
            console.error(new Error('Error al guardar la informacion en la base de datos: '+error));
            return false;
        }
    };
}

module.exports = {User,AditionalInfo}

// async function testing(){
//     let user = await User.findOne('dani@local.com');
//     console.log(user)
// }

// testing()