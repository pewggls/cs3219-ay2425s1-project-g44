const z = require("zod");
const Question = require("../models/question");

exports.getAllQuestions = async (req, res) => {
    const queryResult = await Question.find().exec();
    if (queryResult.length == 0) {
        res.send("NO QUESTIONS AVAILABLE.")
        return
    }
    res.json(queryResult);
};

exports.getQuestionById = async (req, res) => {
    const parsedId = Number(req.params.questionId)
    const queryResult = await Question.findOne({ id: parsedId });
    if (!queryResult) {
        res.send(`Question ID ${parsedId} not found.`)
        return
    }
    res.json(queryResult)
};

exports.getMaxQuestionId = async (req, res) => {
    const queryResult = await Question.findOne().sort({ id: -1}).exec();
    if (!queryResult) {
        res.send("0");
        return
    }
    res.send(`${queryResult.id}`);
}

exports.dummyCallbackFunction = async (req, res) => {
    res.send("SENT A DUMMY RESPONSE");
};