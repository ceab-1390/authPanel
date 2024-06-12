const { mongo, default: mongoose,Schema } = require('./db');
const logguer = require('../logger/logger');


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
    },
    validMail:{
        type: Boolean,
        unique: false,
        required: true,
        default: false 
    }
},{
    timestamps: true
},{
    collection: "users"
} );

const UserModel = new mongoose.model("User", UserSchema);

const tokensSchema = new mongoose.Schema({
    token: {
        type: String,
        unique: true,
        required: true,
    },
    userId:{
        type: Schema.Types.ObjectId,
        required: false,
        ref: UserModel,
    },

},{
    timestamps: true
},{
    collection: "tokens"
});

const TokenModel = new mongoose.model("Tokens", tokensSchema);

class User {
    static async getAll(){
        try {
            const users = await UserModel.find().populate('info');
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
            logguer.error('Error al guardar la informacion en la base de datos: '+error);
            return false;
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
            return true
        } catch (error) {
            console.error(error);
            return false;
        }
    };
    static async verifiedMail(id){
        try {
            const verified = await UserModel.updateOne(
                {_id:id},
                {
                  $set:{
                    validMail: true
                    }  
                },
            );
            return true
        } catch (error) {
            logguer.error(error);
            return false
        }
    };
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
};

class Tokens {
    static async createOne(data){
        try {
            const newData = await TokenModel(data)
            await newData.save()
            return newData
        } catch (error) {
            logguer.error(error)
            return false;
        }
    };
    static async validate(token){
        try {
            const validToken = await TokenModel.findOne({token: token});
            if (validToken){
                return true;
            }
            return false;
        } catch (error) {
            logguer.error(error)
            return false
        }
    };
}



module.exports = {User,AditionalInfo,Tokens,UserModel}

// async function testing(){
//     let user = await User.findOne('dani@local.com');
//     console.log(user)
// }

// testing()