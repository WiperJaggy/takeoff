const express = require('express');
const router = express.Router();
//const { authenticateUser } = require('../middleware/authentication');
const { registerUser,registerAgency, loginUser,loginAgency, forgotPassword , resetPassword, protect, updatePassword} = require('../controllers/authController');

router.post('/register/user', registerUser);
router.post('/login/user', loginUser);

router.post('/register/agency',registerAgency);
router.post('/login/agency', loginAgency);

router.post('/forgotPassword',forgotPassword);
router.patch('/resetPassword/:token',resetPassword)
//protect all the routs after this middleware
router.use(protect)

router.patch('/updateMyPassword', updatePassword)

module.exports = router;
