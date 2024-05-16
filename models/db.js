require('dotenv').config()
const mongoose = require('mongoose');

const mongoUri = process.env.DB_URI

mongoose.connect(mongoUri,{
    useNewUrlParser: true,
}).then(db => {
    console.log('Data Base Connect OK')
}).catch(err =>{
    console.log(new Error('Error al conectar con la base de datos: '+err))
})