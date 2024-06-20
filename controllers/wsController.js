require('dotenv').config()
const {WebSocket} = require('ws'); 
const {v4: uuidv4} = require('uuid');
const Logguer = require('../logger/logger');

const socket = new WebSocket.Server({port: process.env.WS_PORT},()=>{
    console.log('WebSocket start on '+process.env.WS_PORT)
})

const clients = {};
const comand = {};
let clientId; 

socket.on('connection', (ws,req) =>{
    Logguer.debug('Nueva conexion al websocket')
    ws.on('message', data =>{
        data = JSON.parse(data);
        clientId = data.id
        Logguer.debug('Cliente: '+ clientId)
        clients[clientId] = ws;
    });
    ws.onerror = function (err){
        Logguer.error(err)
    }
    ws.on('close', ()=>{
        delete clients[clientId]
        Logguer.info('Conexion del cliente ' +clientId+' cerrada');
    });
});   



module.exports = {clients}