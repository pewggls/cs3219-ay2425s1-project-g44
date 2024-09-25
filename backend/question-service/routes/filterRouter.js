const filterController = require("../controllers/filterController");

const express = require("express");
const router = express.Router();

router.get("/filter", filterController.filterBy);

module.exports = router;