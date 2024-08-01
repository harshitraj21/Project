const express = require('express')
const AuthMiddleware = require('../middlewares/AuthMiddleware');
const { getAllUsersController, getAllDoctorsController, changeAccountStatusController } = require('../controllers/AdminController');

const router = express.Router()

router.get('/getAllUsers', AuthMiddleware, getAllUsersController)

router.get('/getAllDoctors', AuthMiddleware, getAllDoctorsController)

router.post('/changeAccountStatus', AuthMiddleware, changeAccountStatusController)

module.exports = router;