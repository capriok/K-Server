const router = require('express').Router();
const nodemailer = require('nodemailer')
const { cors, corsOptions } = require('../cors/cors')
var whitelist = ['http://localhost:3000', 'https://www.kylecaprio.dev']
require('dotenv').config()

router.use(cors(corsOptions(whitelist)), (req, res, next) => {
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, PATCH, DELETE");
    return res.status(200).json({});
  }
  next();
});

router.post('/send', async (req, res) => {
  const { name } = req.body
  const { email } = req.body
  const { body } = req.body
  console.log(req.body);

  let mailOptions = {
    to: process.env.KC_EMAILTO,
    from: process.env.KC_EMAILACC,
    subject: `New Inquiry (${name})`,
    html: `
      <table style="max-width: 700px; width: 100%;">
      <tr>
        <td>
        <h1 style="text-align: center; font-family: Arial; border-bottom: 1px solid black; padding-bottom: 10px; margin-bottom: 20px;">
          Inquiry
        </td>
      </tr>
      <tr>
        <th><img src="https://i.imgur.com/ByYKcYa.png" alt="" style="width: 100px;"/></th>
      </tr>
      <tr>
        <td style="font-family: Arial; padding-top: 20px;">
          <span style="font-weight: bold">Name: </span>
          <span>${name}</span>
        </td>
      </tr>
      <tr>
        <td style="font-family: Arial; padding-top: 10px;">
          <span style="font-weight: bold">Email: </span>
          <span>${email}</span>
        </td>
      </tr>
      <tr>
        <td>
        <div style="font-family: Arial; width: 100%; box-sizing: border-box; padding: 0 10px; margin-top: 20px; border: 1px solid black; border-radius: 5px;">
          <p style="font-weight: bold">Message body:</p>
          <p>${body}</p>
        </div>
        </td>
      </tr>
      <tr>
      </tr>
    </table>
    `
  };

  let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    ignoreTLS: false,
    auth: {
      user: process.env.KC_EMAILACC,
      pass: process.env.KC_EMAILPASS,
    },
  });


  transporter.sendMail(mailOptions, (error, info) => {
    if (!error) {
      console.log('ID -> ', info.messageId);
      console.log('Sender -> ', email);
      console.log('Receiver -> ', info.envelope.to);
      res.status(200).send('Inquiry Sent')
    } else {
      console.log(error);
      res.status(400).end()
    }
  });
});

module.exports = router
