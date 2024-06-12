const { mongo, default: mongoose,Schema } = require('./db');
const Logguer = require('../logger/logger');
const {UserModel} = require('./userModel');

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
    userId:{
        type: Schema.Types.ObjectId,
        required: true,
        ref: UserModel
    },
},{
    timestamps: true
},{
    collection: "pays"
} );

const PayModel = new mongoose.model("pays",paySchema);

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
}

module.exports = Pay