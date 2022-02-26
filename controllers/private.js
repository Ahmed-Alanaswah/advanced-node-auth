exports.getPrivatedData = (req, res, next) => {
	res.status(200).json({
		succsess: true,
		data: "ypu got access to the private data in thisroute",
	});
};
