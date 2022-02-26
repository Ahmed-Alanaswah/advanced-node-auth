"use strict";
require("dotenv").config({ path: "./config.env" });

const connectDB = require("./config/db");

//connect DB
connectDB();

const express = require("express");

const app = express();

const errorHandler = require("./middleware/error");

app.use(express.json());

app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));

// error handler (should be last piece of middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
	console.log(`server running on port ${PORT}`);
});

process.on("unhandledRejection", (err, promise) => {
	console.log(`logged error: ${err}`);
	server.close(() => process.exit(1));
});
