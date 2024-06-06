require('dotenv').config();
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const homeController = require ('../controllers/homeController');
const auth = require('../midleware/auth');
const midleware = require('../midleware/general');
const googleAuth = require('../controllers/googleAuth');
const passport = require('passport');


router.get('/',userController.index);
router.post('/login',userController.logIn);
router.get('/register',userController.register);
router.post('/register',userController.registerOne);
router.get('/logout',auth.loguedIn ,userController.logOut)
router.get('/home',auth.loguedIn ,homeController.index);
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), userController.logIn)
router.get('/perfil/register',auth.loguedIn,midleware.isRegister,userController.completedRegister);
router.post('/perfil/register',auth.loguedIn,userController.finishRegister);
router.get('/perfil/changePassword',auth.loguedIn,midleware.provider,userController.changePassword)


//sitios
router.get('/sitios',auth.loguedIn,homeController.sitios);

//router.get('/success',userController.googleSuccess);

module.exports = router