const express = require("express");
const { getDoctorInfoController, updateProfileController, getDoctorByIdController, doctorAppointmentController, updateStatusController } = require("../controllers/doctorController");
const AuthMiddleware = require('../middlewares/AuthMiddleware');

const router = express.Router();

router.post("/getDoctorInfo", AuthMiddleware, getDoctorInfoController);

router.post("/updateProfile", AuthMiddleware, updateProfileController);

router.post('/getDoctorById', AuthMiddleware, getDoctorByIdController);

router.get('/doctor_appointments', AuthMiddleware, doctorAppointmentController)

router.post('/update_status', AuthMiddleware, updateStatusController)

module.exports = router; 
