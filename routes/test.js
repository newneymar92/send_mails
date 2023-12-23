const Imap = require('imap');
const nodemailer = require('nodemailer');

// Thông tin tài khoản Gmail của bạn
const emailUser = 'your.gmail@gmail.com';
const emailPass = 'your-gmail-password';

// Tạo một transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// Tạo một kết nối IMAP
const imap = new Imap({
  user: emailUser,
  password: emailPass,
  host: 'imap.gmail.com',
  port: 993,
  tls: true,
});

// Kết nối đến hộp thư đến
imap.connect();

imap.once('ready', () => {
  // Mở hộp thư đến
  imap.openBox('INBOX', false, (err, box) => {
    if (err) throw err;

    // Lấy thông tin thư cuối cùng trong hộp thư
    const lastMessageUID = box.messages.total;
    const fetch = imap.seq.fetch(lastMessageUID, { bodies: '' });

    fetch.on('message', (msg, seqno) => {
      let messageBody = '';

      msg.on('body', (stream) => {
        stream.on('data', (chunk) => {
          messageBody += chunk.toString('utf8');
        });
      });

      msg.once('end', () => {
        // Xây dựng email reply
        const mailOptions = {
          from: emailUser,
          to: 'recipient@gmail.com', // Địa chỉ email của người nhận
          subject: 'Re: ' + box.messages[lastMessageUID - 1].subject,
          text: 'Hello, this is a reply from Node.js!',
        };

        // Gửi email reply
        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return console.log(error);
          }
          console.log('Email reply sent: ' + info.response);
        });
      });
    });

    fetch.once('error', (err) => {
      console.log('Fetch error: ' + err);
    });

    fetch.once('end', () => {
      // Đóng kết nối IMAP khi đã xong
      imap.end();
    });
  });
});

imap.once('error', (err) => {
  console.log('IMAP error: ' + err);
});

imap.once('end', () => {
  console.log('IMAP connection ended');
});

