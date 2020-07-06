const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
           user: 'martin.pose.pose@colexio-karbo.com',
           pass: 'Alumno*2018'
       }
   });

  module.exports = transporter;