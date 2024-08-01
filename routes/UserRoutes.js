const express = require('express')
const { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationController, getAllDoctorsController, bookAppointmentController, bookingAvailabilityController, userAppointmentsController } = require('../controllers/UserController')
const AuthMiddleware = require('../middlewares/AuthMiddleware')

const router = express.Router()

router.post('/login', loginController)   //These router will handle the HTTP requests(POST)

router.post('/register', registerController)

router.post('/getUserData', AuthMiddleware, authController)

router.post("/apply_doctor", AuthMiddleware, applyDoctorController)

router.post("/get_all_notification", AuthMiddleware, getAllNotificationController)

router.post("/delete_all_notification", AuthMiddleware, deleteAllNotificationController)

router.get('/getAllDoctors', AuthMiddleware, getAllDoctorsController)

router.post('/book_appointment', AuthMiddleware, bookAppointmentController)

router.post('/booking_availability', AuthMiddleware, bookingAvailabilityController)

router.get('/user_appointments', AuthMiddleware, userAppointmentsController)

module.exports = router   