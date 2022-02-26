const crypto = require("crypto");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
// const getSignToken = require("../models/User");
const ErroResponse = require("../utils/errorResponse");
exports.register = async (req, res, next) => {
	const { username, email, password } = req.body;

	try {
		const user = await User.create({
			username,
			email,
			password,
		});

		sendToken(user, 201, res);
	} catch (error) {
		next(error);
	}
};

exports.login = async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return next(new ErroResponse("please provide an email and password", 400));
	}

	try {
		const user = await User.findOne({ email }).select("+password");
		if (!user) {
			return next(new ErroResponse("Invalid Credetntials", 401));
		}

		const isMatch = await user.matchPasswords(password);

		if (!isMatch) {
			return next(new ErroResponse("Invalid Credetntials", 401));
		}
		sendToken(user, 200, res);
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
};

exports.forgotpassword = async (req, res, next) => {
	const { email } = req.body;

	try {
		const user = await User.findOne({ email });
		if (!user) {
			return next(new ErroResponse("email could not bes sent", 404));
		}

		const resetToken = user.getResetPassWordToken();

		await user.save();

		const resetUrl = `http://localhost:3000/passwordreset/${resetToken}`;

		const message = `
			<h1>you have requested new password reset</h1>
			<p>please go to this link to reset your password</p>
			<a href=${resetUrl} clicktracking=off>${resetUrl}</a>
		`;
		try {
			await sendEmail({
				to: user.email,
				subject: "password reset request",
				text: message,
			});

			res.status(200).json({
				success: true,
				data: "email send",
			});
		} catch (error) {
			user.resetPassWordToken = undefined;
			user.resetPassWordExpire = undefined;
			await user.save();
			return next(new ErroResponse("Email could not be send", 500));
		}
	} catch (error) {
		next(error);
	}
};
exports.resetpassword = async (req, res, next) => {
	const resetPasswordToken = crypto
		.createHash("sha256")
		.update(req.params.resetToken)
		.digest("hex");

	try {
		const user = await User.findOne({
			resetPasswordToken,
			resetPassWordExpire: { $gt: Date.now() },
		});

		if (!user) {
			return next(new ErroResponse("Invalid Reset Token", 400));
		}

		user.password = req.body.password;
		user.resetPassWordToken = undefined;
		user.resetPassWordExpire = undefined;
		await user.save();

		res.status(201).json({
			success: true,
			data: "password reset success",
		});
	} catch (error) {
		next(error);
	}
};

const sendToken = (user, statusCode, res) => {
	const token = user.getSignToken();
	res.status(statusCode).json({ success: true, token });
};
