exports.getAllQuestions = async (req, res) => {
    res.send("SENT ALL QUESTIONS");
};

exports.getQuestionById = async (req, res) => {
    res.send(`SENT QUESTION NUMBER ${req.params.questionId}`)
};

exports.dummyCallbackFunction = async (req, res) => {
    res.send("SENT A DUMMY RESPONSE");
};