const Photo = require('../models/Photo')
const Booking = require('../models/Booking')

exports.getStats = async (req,res)=>{

const totalPhotos = await Photo.countDocuments()

const totalAppointments =
await Booking.countDocuments()


const pendingAppointments =
await Booking.countDocuments({

status:'Pending'

})


res.json({

totalPhotos,

totalAppointments,

pendingAppointments

})

}