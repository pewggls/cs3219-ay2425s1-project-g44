const express = require("express");

const questionRouter = express.Router();
const questionController = require("../controllers/questionController")
const questionValidator = require("../middlewares/questionValidator")

questionRouter.use("/byId/:questionId", questionValidator.validateQuestionId)

// API Endpoints

questionRouter.get("/all", questionController.getAllQuestions);

questionRouter.get("/maxQuestionId", questionController.getMaxQuestionId);

questionRouter.get("/byId/:questionId", questionController.getQuestionById);

questionRouter.get("/byObjectId/:questionObjectId", questionController.getQuestionByObjectId);

questionRouter.use("/batch", express.json())
questionRouter.post("/batch", questionController.getQuestionsByIds);

questionRouter.get("/dummy", questionController.dummyCallbackFunction);

questionRouter.use("/add", express.json())
questionRouter.post("/add", questionController.addQuestion);

questionRouter.delete("/delete/:questionId", questionController.deleteQuestion)

questionRouter.use("/update/:questionId", express.json());
questionRouter.put("/update/:questionId", questionController.updateQuestion);

questionRouter.use("/patch/:questionId", express.json());
questionRouter.patch("/patch/:questionId", questionController.patchQuestion);

module.exports = questionRouter