const express = require('express');
const authController = require('./../controllers/authController')
const userController = require('../controllers/userController');
const router = express.Router();



router.use(authController.protect)
router.patch('/updateMe' ,userController.uploadUserPhoto,userController.resizeUserPhoto, userController.updateMe);

router.get('/getMe',userController.getMe);


router.get('/',userController.getAllUsers);
router.get('/:id', userController.getUser);


module.exports = router;