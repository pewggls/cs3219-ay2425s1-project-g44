const z = require("zod");

exports.getAllQuestions = async (req, res) => {
    res.send("SENT ALL QUESTIONS");
};

exports.getQuestionById = async (req, res) => {
    const parsedId = Number(req.params.questionId)
    res.send(`SENT QUESTION NUMBER ${parsedId}`)
};

exports.dummyCallbackFunction = async (req, res) => {
    res.send("SENT A DUMMY RESPONSE");
};