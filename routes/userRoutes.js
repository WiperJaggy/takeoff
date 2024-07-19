const express = require('express');
const authController = require('./../controllers/authController')
const userController = require('../controllers/userController');
const upload = require('../config/multer');

const router = express.Router();

router.get('/get-serivces',userController.getAgencyServices);

router.use(authController.protect)
router.patch('/updateMe' , userController.updateMe);

router.post('/upload-profile-photo',upload.single('file'), userController.uploadPhoto);

router.get('/getMe',userController.getMe);
router.patch('/return-rented-car',userController.returnCar);

router.get('/',userController.getAllUsers);
router.get('/:id', userController.getUser);


module.exports = router;