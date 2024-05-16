require('dotenv').config();
const express = require('express');
const router = express.Router();
const userController = require('./controllers/userController')
const homeController = require ('./controllers/homeController')
const auth = require('./midleware/auth');


router.get('/',userController.index);
router.post('/login',userController.logIn);
router.get('/logout',auth.loguedIn ,userController.logOut)
router.get('/home',auth.loguedIn ,homeController.index);

module.exports = router