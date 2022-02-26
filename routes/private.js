const express = require("express");

const router = express.Router();

const { getPrivatedData } = require("../controllers/private");

const { protect } = require("../middleware/auth");

router.route("/").get(protect, getPrivatedData);

module.exports = router;
