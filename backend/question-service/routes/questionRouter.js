const express = require("express");

const questionRouter = express.Router();
const questionController = require("../controllers/questionController")

questionRouter.get("/all", questionController.getAllQuestions);

questionRouter.get("/:questionId", questionController.getQuestionById);

questionRouter.get("/dummy", questionController.dummyCallbackFunction);

module.exports = questionRouter