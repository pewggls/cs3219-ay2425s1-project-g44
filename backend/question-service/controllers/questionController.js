const z = require("zod");

exports.getAllQuestions = async (req, res) => {
    res.send("SENT ALL QUESTIONS");
};

exports.getQuestionById = async (req, res) => {
    const questionIdSchema = z.number().int().positive();
    parsedId = questionIdSchema.safeParse(Number(req.params.questionId));
    if (!parsedId.success) {
        res.status(400).send(`Invalid Question ID ${req.params.questionId}`)
        return
    } 
    res.send(`SENT QUESTION NUMBER ${parsedId.data}`)
};

exports.dummyCallbackFunction = async (req, res) => {
    res.send("SENT A DUMMY RESPONSE");
};