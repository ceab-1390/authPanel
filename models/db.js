require('dotenv').config()
const Logguer = require('../logger/logger');
const { mongo, default: mongoose, Schema, model, isObjectIdOrHexString } = require('mongoose');


const mongoUri = process.env.DB_URI

/*mongoose.connect(mongoUri,{
    useNewUrlParser: true,
}).then(db => {
    console.log('Data Base Connect OK')
}).catch(err =>{
    console.log(new Error('Error al conectar con la base de datos: '+err))
})*/

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