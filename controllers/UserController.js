const userModel = require('../models/UserModels')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const doctorModel = require('../models/doctorModels')
const appointmentModel = require('../models/appointmentModel')
const moment = require('moment')

const registerController = async (req, res) => {
    try {
        const existingUser = await userModel.findOne({ email: req.body.email })
        if (existingUser) {
            return res.status(200).send({ message: 'User Already Exists', success: false })
        }
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)
        req.body.password = hashedPassword
        const newUser = new userModel(req.body)
        await newUser.save()
        res.status(201).send({ message: "Registration is done successfully", success: true });
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: `Register Controller gives an error : ${error.message}` })
    }
};


const loginController = async (req, res) => {
    try {
        const user = await userModel.findOne({ email: req.body.email })
        if (!user) {
            return res.status(200).send({ message: 'User not found', success: false })
        }
        const isMatch = await bcrypt.compare(req.body.password, user.password)
        if (!isMatch) {
            return res.status(200).send({ message: 'Invalid email or password', success: false })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' })
        res.status(200).send({ message: 'Login is done successfully', success: true, token })
    } catch (error) {
        console.log(error)
        res.status(500).send({ success: false, message: `Login Controller gives an error: ${error.message}` })
    }
};


const authController = async (req, res) => {
    try {
        const user = await userModel.findById({ _id: req.body.userId })
        user.password = undefined
        if (!user) {
            return res.status(200).send({ message: 'User not found', success: false })
        }
        else {
            res.status(200).send({
                success: true,
                data: user
            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).send({ message: 'Authentication Error', success: false, error })
    }
}

const applyDoctorController = async (req, res) => {
    try {
        const newDoctor = await doctorModel({ ...req.body, status: 'Pending' })
        await newDoctor.save()
        const adminUser = await userModel.findOne({ isAdmin: true })
        if (adminUser) {
            const notification = adminUser.notification
            notification.push({
                type: 'apply_doctor_request',
                message: `${newDoctor.firstName} ${newDoctor.lastName} has sent an application for doctor account.`,
                data: {
                    doctorId: newDoctor._id,
                    name: newDoctor.firstName + " " + newDoctor.lastName,
                    onClickPath: '/admin/doctors'
                }
            })
            await userModel.findByIdAndUpdate(adminUser._id, { notification })
        }
        res.status(201).send({
            success: true,
            message: 'Doctor Account has been applied successfully'
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in applying for Doctor"
        })
    }
}


const getAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        const seenNotification = user.seenNotification;
        const notification = user.notification;
        seenNotification.push(...notification);
        user.notification = [];
        user.seenNotification = notification;
        const updatedUser = await user.save();
        res.status(200).send({
            success: true,
            message: "All the notification are marked as read",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Error in notification",
            success: false,
            error
        });
    }
};


const deleteAllNotificationController = async (req, res) => {
    try {
        const user = await userModel.findOne({ _id: req.body.userId });
        user.notification = [];
        user.seenNotification = [];
        const updatedUser = await user.save();
        updatedUser.password = undefined;
        res.status(200).send({
            success: true,
            message: "Notifications are successfully deleted.",
            data: updatedUser,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Unable to delete all the notifications",
            error,
        });
    }
};

const getAllDoctorsController = async (req, res) => {
    try {
        const doctors = await doctorModel.find({ status: 'Approved' })
        res.status(200).send({
            success: true,
            message: "Doctors List has been fetched successfully.",
            data: doctors
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error while fetching doctors."
        })
    }
}


const bookAppointmentController = async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        const time = moment(req.body.time, "HH:mm");
        const doctor = await doctorModel.findById(req.body.doctorId);
        const [startTime, endTime] = doctor.timings.map(time => moment(time, "HH:mm"));

        if (time.isBefore(startTime) || time.isAfter(endTime)) {
            return res.status(200).send({
                message: "Selected time is outside the doctor's working hours",
                success: false,
            });
        }

        req.body.date = date;
        req.body.time = time.toISOString();
        req.body.status = "Pending";
        const newAppointment = new appointmentModel(req.body);
        await newAppointment.save();
        const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
        user.notification.push({
            type: "New-appointment-request",
            message: `A new Appointment Request from ${req.body.userInfo.name}`,
            onClickPath: "/user/appointments",
        });
        await user.save();
        res.status(200).send({
            success: true,
            message: "Appointment Booking is done successfully",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error In Booking",
        });
    }
};

const bookingAvailabilityController = async (req, res) => {
    try {
        const date = moment(req.body.date, "DD-MM-YYYY").toISOString();
        const time = moment(req.body.time, "HH:mm");
        const doctor = await doctorModel.findById(req.body.doctorId);
        const [startTime, endTime] = doctor.timings.map(time => moment(time, "HH:mm"));

        if (time.isBefore(startTime) || time.isAfter(endTime)) {
            return res.status(200).send({
                message: "Selected time is outside the doctor's working hours",
                success: false,
            });
        }

        const fromTime = time.subtract(1, "hours").toISOString();
        const toTime = time.add(1, "hours").toISOString();

        const appointments = await appointmentModel.find({
            doctorId: req.body.doctorId,
            date,
            time: {
                $gte: fromTime,
                $lte: toTime,
            },
        });

        if (appointments.length > 0) {
            return res.status(200).send({
                message: "Appointments not available at this time",
                success: false,
            });
        } else {
            return res.status(200).send({
                success: true,
                message: "Appointments are available at the time selected",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error In Booking",
        });
    }
};



const userAppointmentsController = async (req, res) => {
    try {
        const appointments = await appointmentModel
            .find({ userId: req.body.userId })
            .populate({
                path: 'doctorId',
                model: 'doctors',
                select: 'firstName lastName phone specialization feesPerConsultation'
            })
            .exec();

        res.status(200).send({
            success: true,
            message: 'User Appointments have been fetched successfully.',
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in user appointments.",
        });
    }
};





module.exports = { loginController, registerController, authController, applyDoctorController, getAllNotificationController, deleteAllNotificationController, getAllDoctorsController, bookAppointmentController, bookingAvailabilityController, userAppointmentsController }; 