const appointmentModel = require("../models/appointmentModel");
const doctorModel = require("../models/doctorModels");
const userModel = require("../models/UserModels");


const getDoctorInfoController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        res.status(200).send({
            success: true,
            message: "Doctor data has been fetched successfully.",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in fetching doctor details",
        });
    }
};


const updateProfileController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOneAndUpdate({ userId: req.body.userId }, req.body);
        res.status(201).send({
            success: true,
            message: "Doctor profile has been updated successfully.",
            data: doctor,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            message: "Doctor profile update issue",
            error,
        });
    }
};

const getDoctorByIdController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ _id: req.body.doctorId })
        res.status(200).send({
            success: true,
            message: "Successfully fetched the doctor information.",
            data: doctor
        })
    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            error,
            message: "Error in getting doctor information."
        })
    }
}


const doctorAppointmentController = async (req, res) => {
    try {
        const doctor = await doctorModel.findOne({ userId: req.body.userId });
        const appointments = await appointmentModel
            .find({ doctorId: doctor._id })
            .populate({
                path: 'userId',
                model: 'users',
                select: 'name email',
            })
            .exec();
        res.status(200).send({
            success: true,
            message: "Doctor Appointments has been fetched successfully",
            data: appointments,
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error in Doctor Appointments",
        });
    }
};


const updateStatusController = async (req, res) => {
    try {
        const { appointmentsId, status } = req.body;
        const appointments = await appointmentModel.findByIdAndUpdate(appointmentsId, { status });
        const user = await userModel.findOne({ _id: appointments.userId });
        const notification = user.notification;
        notification.push({
            type: "Status has been updated",
            message: `Your appointment has been updated -->> ${status}`,
            onCLickPath: "/doctor_appointments",
        });
        await user.save();
        res.status(200).send({
            success: true,
            message: "Appointment Status Updated",
        });
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error,
            message: "Error In Update Status",
        });
    }
};



module.exports = { getDoctorInfoController, updateProfileController, getDoctorByIdController, doctorAppointmentController, updateStatusController };  