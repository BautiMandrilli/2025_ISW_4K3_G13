

const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify()
  .then(() => {
    console.log("Conexión SMTP OK ✅");

    return transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: "pavonbenja@gmail.com", // tu mail de prueba
      subject: "Prueba Nodemailer",
      text: "¡Funciona el envío de mails!",
    });
  })
  .then(() => console.log("Mail enviado correctamente ✅"))
  .catch((err) => console.error("Error Nodemailer:", err));
