const nodemailer = require("nodemailer");

const sendEmail = (options) => {
	const transporeter = nodemailer.createTransport({
		service: process.env.EMAIL_SRVICE,
		auth: {
			user: process.env.EMAIL_USERNAME,
			pass: process.env.EMAIL_PASSWORD,
		},
	});

	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: options.to,
		subject: options.subject,
		html: options.text,
	};

	transporeter.sendMail(mailOptions, function (err, info) {
		if (err) {
			console.log(err);
		} else {
			console.log(info);
		}
	});
};

module.exports = sendEmail;
