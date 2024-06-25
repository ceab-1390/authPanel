require('dotenv').config();
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const homeController = require ('../controllers/homeController');
const backofficeController = require('../controllers/backOfficeController');
const auth = require('../midleware/auth');
const midleware = require('../midleware/general');
const googleAuth = require('../controllers/googleAuth');
const passport = require('passport');
const apiController = require('../controllers/api/apiAuthController');
const profileController = require('../controllers/profileController')


router.get('/',userController.index);
router.post('/login',userController.logIn);
router.get('/register',userController.register);
router.post('/register',userController.registerOne);
router.get('/logout',auth.loguedIn ,userController.logOut);
router.get('/home',auth.loguedIn ,homeController.index);
router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));
router.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/error' }), userController.logIn)
router.get('/perfil',auth.loguedIn,profileController.index);
router.get('/perfil/register',auth.loguedIn,midleware.isRegister,userController.completedRegister);
router.post('/perfil/register',auth.loguedIn,userController.finishRegister);
router.get('/perfil/validateMail/:tokenMail',userController.validateMail)
router.get('/perfil/pay',auth.loguedIn,userController.payIndex);
router.post('/perfil/pay',auth.loguedIn,userController.payConfirm);
//router.get('/perfil/changePassword',auth.loguedIn,midleware.provider,userController.changePassword)
router.post('/perfil/changePassword',auth.loguedIn,midleware.provider,userController.changePassword)


//sitios
router.get('/sitios',auth.loguedIn,homeController.sitios);


//backoffice
router.get('/backoffice',backofficeController.login);
router.post('/backoffice/login',backofficeController.auth);
router.get('/backoffice/home',auth.isAdmin,backofficeController.index);
router.get('/backoffice/clientsFree/:page',auth.isAdmin,backofficeController.clientsFree);
router.post('/backoffice/clientsFree/activate/',auth.isAdmin,backofficeController.activateClient);
router.get('/backoffice/logout',auth.isAdmin ,backofficeController.logOut);

//router.get('/showDocument/:img',auth.isAdmin,backofficeController.showDocument)

//router.get('/success',userController.googleSuccess);

router.post('/api/auth',apiController.auth);

module.exports = router