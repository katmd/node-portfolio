require('dotenv').config();
const path = require("path");
const express = require("express");
const morgan = require("morgan");
const compression = require("compression");
const app = express();
const nodemailer = require("nodemailer");
const PORT = process.env.PORT || 3000;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
module.exports = app;

// logging middleware
app.use(morgan("dev"));

// body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// compression middleware
app.use(compression());

// POST route from contact form
app.post("/contact", (req, res, next) => {
  // Instantiate the SMTP server
  const smtpTransport = nodemailer.createTransport({
    host: "smtp.mail.yahoo.com",
    port: 465,
    service: "yahoo",
    secure: true,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    logger: true
  });

  // Specify what the email will look like
  const mailOpts = {
    from: EMAIL_USER,
    to: EMAIL_USER,
    subject: `New Message from ${req.body.name} via Portfolio Contact Form`,
    html: `<html><body><h1>Hello katmd!</h1><br><h2>You have a new message from ${req.body.name} (${req.body.email}):</h2><br><p style="background-color: lightgray; padding: 8px">${req.body.message}</p></body></html>`
  };

  // Attempt to send the email
  smtpTransport.sendMail(mailOpts, (error) => {
    if (error) {
      res.send("Submission unsuccessful.");
    } else {
      res.send("Submission successful.");
    }
  });
});

// any remaining requests with an extension (.js, .css, etc.) send 404
app.use((req, res, next) => {
  if (path.extname(req.path).length) {
    const err = new Error("Not found");
    err.status = 404;
    next(err);
  } else {
    next();
  }
});

// error handling endware
app.use((err, req, res, next) => {
  console.error(err);
  console.error(err.stack);
  res.status(err.status || 500).send(err.message || "Internal server error.");
});

app.listen(PORT, () => console.log(`Starting up on port ${PORT}`));
