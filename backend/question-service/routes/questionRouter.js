const express = require("express");

const questionRouter = express.Router();
const questionController = require("../controllers/questionController")
const questionValidator = require("../middlewares/questionValidator")

questionRouter.get("/all", questionController.getAllQuestions);

questionRouter.use("/:questionId", questionValidator.validateQuestionId)
questionRouter.get("/:questionId", questionController.getQuestionById);

questionRouter.get("/dummy", questionController.dummyCallbackFunction);

module.exports = questionRouter