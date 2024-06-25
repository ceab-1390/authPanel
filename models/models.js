const { mongo, default: mongoose,Schema } = require('./db');
const Logguer = require('../logger/logger');
//const {User} = require('./userModel');

const paySchema = new mongoose.Schema({
    document: {
        type: String,
        unique: false,
        required: true,
    },
    phone: {
        type: String,
        unique: false,
        required: true,
    },
    reference: {
        type: String,
        unique: false,
        required: true,
    },
    amount: {
        type: String,
        unique: false,
        required: true,
    },
    username:{
        type: String,
        required: true,
        unique: false
    },
},{
    timestamps: true
},{
    collection: "cms_pays"
} );

const PayModel = new mongoose.model("cms_pays",paySchema);

const userAppSchema = new mongoose.Schema({
    correo: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        unique: false,
        required: true,
    },
    admin: {
        type: String,
        unique: false,
        required: true,
        default: 'Si',
    },
    nombre: {
        type: String,
        unique: false,
        required: true,
    },
    numero:{
        type: String,
        unique: false,
        required: false,
    },
    publico: {
        type: String,
        unique: false,
        required: true,
        default: 'Si'
    },
    tipo: {
        type: String,
        unique: false,
        required: false,
    },
    urllogoTipo:{
        type: String,
        unique: false,
        required: false,
    },
    
},{
    timestamps: false
},{
    collection: "Usuarios"
});

const UserAppModel = new mongoose.model("Usuarios",userAppSchema,"Usuarios");



const userBackOfficeSchema = new mongoose.Schema({
    user: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        unique: false,
        required: true,
    },
    admin: {
        type: Number,
        unique: false,
        required: true,
        default: 1,
    },
    name: {
        type: String,
        unique: false,
        required: true,
    },
    lastname:{
        type: String,
        unique: false,
        required: false,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
},{
    timestamps: false
},{
    collection: "backOfficeUsers"
});

const BackOfficeUsersModel = new mongoose.model("bacOfficeUsers",userBackOfficeSchema);

/*const payUsersInfoSchema = new mongoose.Schema({
    userId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: UserModel
    },
    payId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: PayModel
    },
    expirate: {
        type: String,
        unique: false,
        required: true,
        default: '123'
    },
},{
    timestamps: true
},{
    collection: "paysUsersInfo"
});

const PayUsersInfoModel = new mongoose.model("payUsersInfo",payUsersInfoSchema);


class InfoPay{
    static async createOne(data){
        try {
            Logguer.log(data)
            const newData = await PayUsersInfoModel(data)
            await newData.save()
            return newData
        } catch (error) {
            Logguer.error(error)
            return false;
        }
    }; 
};*/

class Pay{
    static async createOne(data){
        try {
            const newData = await PayModel(data)
            await newData.save()
            return newData
        } catch (error) {
            Logguer.error(error)
            return false;
        }
    };
    static async findOne(pay){
        try {
            const validPay = await PayModel.findOne({reference: pay}).populate('userId');
            if (validPay){
                let data = {}
                //data.userId = validPay.userId;
                //data.payId = validPay._id;
                //await InfoPay.createOne(data)
                return validPay;
            }
            return false;
        } catch (error) {
            Logguer.error(error)
            return false
        }
    };
    static async validOne(pay,phone){
        try {
            const validPay = await PayModel.findOne({
                $and:
                [
                    {reference: pay}
                    ,{phone: phone}
                ]
            });
            if (validPay){
                return true;
            }
            return false;
        } catch (error) {
            Logguer.error(error)
            return true
        }
    };

};

class UserApp {
    static async createOne(data){
        try {
            Logguer.debug(data)
            const newData = await UserAppModel(data)
            await newData.save()
            return newData
        } catch (error) {
            Logguer.error(error)
            return false;
        }
    };

    static async findOne(mail){
        try {
            const user = await UserAppModel.findOne({correo:mail});
            return user;
        } catch (error) {
            Logguer.error(error);
            return false; 
        }
    }
};

class UserBackoffice {
    static async createOne(data){
        try {
            const newData = await BackOfficeUsersModel(data)
            await newData.save()
            return newData
        } catch (error) {
            Logguer.error(error)
            return false;
        }
    };

    static async find(){
        try {
            const users = await BackOfficeUsersModel.find();
            return users;
        } catch (error) {
            Logguer.error(error);
            return false; 
        }
    };

    static async findOneId(id){
        try {
            const user = await BackOfficeUsersModel.findOne({_id:id});
            return user;
        } catch (error) {
            Logguer.error(error);
            return false; 
        }
    };
    static async findOneUser(username){
        try {
            const user = await BackOfficeUsersModel.findOne({user:username});
            return user;
        } catch (error) {
            Logguer.error(error);
            return false; 
        }
    };
    
    static async validate(username){
        try {
            const user = await BackOfficeUsersModel.findOne({user:username});
            if(user){
                return true; 
            }else{
                return false;
            }
        } catch (error) {
            Logguer.error(error);
            return false; 
        }
    };
};


module.exports = {Pay,PayModel,UserApp,UserBackoffice}