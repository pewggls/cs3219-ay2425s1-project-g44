const filterController = require("../controllers/filterController");

const express = require("express");
const filterRouter = express.Router();

filterRouter.get("/q", filterController.filterBy);

module.exports = filterRouter;