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
    collection: "pays"
} );

const PayModel = new mongoose.model("pays",paySchema);

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


module.exports = {Pay,PayModel}