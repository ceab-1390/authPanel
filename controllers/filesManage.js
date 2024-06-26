const AWS = require('aws-sdk');
const Logguer = require('../logger/logger');
const fs = require('fs');
const path = require('path');
const Transform = require('stream').Transform;

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION
});

const s3 = new AWS.S3();


async function s3Upload(path,name,ruta){
    const params = {
        Bucket: process.env.S3_BUCKET,
        Key: name, 
        Body: path,
        ACL: 'public-read',
    }
    try {
        const result = await s3.upload(params).promise();
        deleteFileTemp(ruta);
        return result.Location  
    } catch (error) {
        Logguer.error(error);
        deleteFileTemp(ruta);
        return false;
    }

}
 

async function manageFile(file){
    let data = {};
    try {
        //Logguer.log(file)
        const extend = path.extname(file.originalFilename);
        data.name = file.newFilename + extend
        data.fileStream = fs.createReadStream(file.filepath);
        data.path = file.filepath;
        return data 
    } catch (error) {
        Logguer.error(error);
        return false;
    }

};

function deleteFileTemp(path){
    fs.unlink(path, (err)=>{
        if (err){
            Logguer.error(err);
            return;
        }else{
            Logguer.debug('Archivo: '+path+' borrado')
        }
    })
}



module.exports = {s3Upload,manageFile}