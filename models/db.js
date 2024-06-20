require('dotenv').config()
const Logguer = require('../logger/logger');
const { mongo, default: mongoose, Schema, model, isObjectIdOrHexString } = require('mongoose');


const mongoUri = process.env.DB_URI


class Connect {
  constructor (MongoInstance){
    this.mongoose = MongoInstance;
  };
  async connect(){
    try {
      await this.mongoose.connect(mongoUri);
      Logguer.info('DB Connected OK');
    } catch (error) {
      Logguer.error(error);
    }
  };
}

const db = new Connect(mongoose);
db.connect();
module.exports = {db,default: mongoose, Schema, model, isObjectIdOrHexString};